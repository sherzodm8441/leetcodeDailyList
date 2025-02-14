//returns todays Date in YYYY-MM-DD format
function getDate(){
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = yyyy + '-' + mm + '-' + dd;
    return formattedToday
}

console.log(getDate());

//date format YYYY-MM-DD
//given 2 dates with the soecified format
//returns the differences between them in days
function getDateDiff(date1, date2){
    date1 = new Date(date1);
    date2 = new Date(date2);

// Get the difference in milliseconds
    const diffInMs = date2 - date1;

// Convert the difference to days
    const diffInDays = Math.abs(diffInMs) / (1000 * 60 * 60 * 24);

    console.log(`Difference in days: ${diffInDays}`);
    return diffInDays;
}

function fetchProblems(){
    return new Promise(resolve => {
        chrome.storage.local.get(["problems"], (obj) => {
            resolve(obj["problems"] ? JSON.parse(obj["problems"]) : [])
        })
    }) 
}

async function checkBoxEventHandler(e){
    console.log(e.target.id);
    let today = getDate();
    if(this.checked){
        

        let id = e.target.id.split("-")[1];
        let problems = await fetchProblems();

        let problem = problems.find(problem => problem.id === id);

        if(problem["datesCompleted"].length !== 0){
            if(problem["datesCompleted"][problem["datesCompleted"].length - 1] !== today){
                problem["datesCompleted"].push(today);
            }
        }else{
            problem["datesCompleted"].push(today);
        }
        console.log(problem["datesCompleted"])

        let removeIndex = problems.findIndex(problem => problem.id === id);
        problems.splice(removeIndex, 1);

        chrome.storage.local.set({ problems : JSON.stringify([problem, ...problems]) }).then(() => {
            console.log("Value is set");
            populateProblemsToDo().then(()=>{
                populateProblemsCompleted();
            })
            
          });
    }else{
        console.log("unchecked");
        let id = e.target.id.split("-")[1];
        let problems = await fetchProblems();


        let problem = problems.find(problem => problem.id === id);

        if(problem && problem["datesCompleted"].length !== 0){
            if(problem["datesCompleted"][problem["datesCompleted"].length - 1] === today){
                problem["datesCompleted"].pop();
            }
        }

        let removeIndex = problems.findIndex(problem => problem.id === id);
        problems.splice(removeIndex, 1);

        chrome.storage.local.set({ problems : JSON.stringify([problem, ...problems]) }).then(() => {
            console.log("Value is set");
            populateProblemsToDo().then(()=>{
                populateProblemsCompleted();
            })
            
          });
    }
}

async function fetchProblemsCompleted(){
    let problems = await fetchProblems();

    let completed = [];
    let today = getDate();

    for(let i = 0; i < problems.length; i++){
        let problem = problems[i];

        if(problem["datesCompleted"].length !== 0){
            let lastDate = problem["datesCompleted"][problem["datesCompleted"].length - 1];
            if(lastDate === today){
                completed.push(problem);
            }
        }
    }

    return completed;
}
async function populateProblemsCompleted(){
    let problems = await fetchProblemsCompleted();

    let el = document.querySelector(".completed");
    el.innerHTML = '';
    let ul = document.createElement("ul");
    ul.style.cssText = "list-style-type: none;"
    
    for(let i = 0; i < problems.length; i++){
        let problem = document.createElement("a");
        problem.textContent = problems[i]["title"];
        problem.href = problems[i]["url"];
        problem.target = "_blank";
        problem.style.cssText = "text-decoration: none;"

        let div = document.createElement("div");
        div.className = "a-div";

        let checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.addEventListener("change", checkBoxEventHandler);
        checkBox.checked = true;
        checkBox.id = "checkBox-" + problems[i]["id"];
        checkBox.className = "check";

        div.append(checkBox);
        div.append(problem);


        let li = document.createElement("li");
        li.append(div);
        ul.append(li);
    }
    el.append(ul);
}

async function fetchProblemsToDo(){
    let problems = await fetchProblems();

    let todo = [];

    let today = getDate();

    for(let i = 0; i < problems.length; i++){
        let problem = problems[i];
        let len = problems[i]["datesCompleted"].length;

        if(len !== 0){
            let lastDateCompleted = problems[i]["datesCompleted"][len - 1];

            let daysSinceCompletion = getDateDiff(today, lastDateCompleted);

            if(len == 1 && daysSinceCompletion >= 5){
                todo.push(problem);
            }else if(len == 2 && daysSinceCompletion >= 8){
                todo.push(problem);
            }else if(len == 3 && daysSinceCompletion >= 15){
                todo.push(problem);
            }else if(len >= 4 && daysSinceCompletion >= 90){
                todo.push(problem);
            }


        }else{
            //if completedDates length is 0, add to todo
            todo.push(problem);
        }
    }
    return todo;
}

async function populateProblemsToDo(){
    let problems = await fetchProblemsToDo();
    console.log("problems", problems)
    
    let el = document.querySelector(".todo");
    el.innerHTML = '';
    let ul = document.createElement("ul");
    ul.style.cssText = "list-style-type: none;"
    
    for(let i = 0; i < problems.length; i++){
        let problem = document.createElement("a");
        problem.textContent = problems[i]["title"];
        problem.href = problems[i]["url"];
        problem.target = "_blank";
        problem.style.cssText = "text-decoration: none;"

        let div = document.createElement("div");
        div.className = "a-div";

        let checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.addEventListener("change", checkBoxEventHandler);
        // checkBox.checked = false;
        checkBox.id = "checkBox-" + problems[i]["id"];
        checkBox.className = "check";

        div.append(checkBox);
        div.append(problem);


        let li = document.createElement("li");
        li.append(div);
        ul.append(li);
    }
    el.append(ul);
}

populateProblemsToDo()
populateProblemsCompleted()

//POPULATE with all added problems
async function populatePopup(){
    let problems = await fetchProblems();
    console.log(problems);
    
    let el = document.querySelector(".problems");
    let ul = document.createElement("ul");
    ul.style.cssText = "list-style-type: none;"
    
    for(let i = 0; i < problems.length; i++){
        let problem = document.createElement("a");
        problem.textContent = problems[i]["title"];
        problem.href = problems[i]["url"];
        problem.target = "_blank";
        problem.style.cssText = "text-decoration: none;"

        let div = document.createElement("div");

        // let checkBox = document.createElement("input");
        // checkBox.type = "checkbox";
        // checkBox.addEventListener("change", checkBoxEventHandler);
        // checkBox.checked = true;

        // div.append(checkBox);
        div.append(problem);


        let li = document.createElement("li");
        li.append(div);
        ul.append(li);
    }
    el.append(ul);
console.log(problems[0]);
} 

populatePopup()

// const newProblem = {
//     title : title,
//     id : id,
//     url : url,
//     dateAdded : date,
//     datesCompleted : []
// };

// const mockData = [
//     {
//         title : "title1",
//         id : "0001",
//         url : "www.youtube.com",
//         dateAdded : "2024-11-08",
//         datesCompleted : ["2024-11-12"]
//     },
//     {
//         title : "title2",
//         id : "0002",
//         url : "www.youtube.com",
//         dateAdded : "2024-10-08",
//         datesCompleted : ["2024-10-12", "2024-10-29"]
//     },
//     {
//         title : "title3",
//         id : "0003",
//         url : "www.youtube.com",
//         dateAdded : "2024-08-08",
//         datesCompleted : ["2024-08-12", "2024-09-20", "2024-10-10"]
//     }
// ];

// async function addMockData(){
//     let problems = await fetchProblems();

//     chrome.storage.local.set({ problems : JSON.stringify([...mockData, ...problems]) }).then(() => {
//         console.log("Value is set");
//         // populateProblemsToDo().then(()=>{
//         //     populateProblemsCompleted();
//         // })
        
//       });
// }
// async function removeMockData(){
//     let problems = await fetchProblems()

//     for(let i = 0; i < mockData.length; i++){
//         let removeIndex = problems.findIndex(problem => problem.id === mockData[i].id);
//         problems.splice(removeIndex, 1);
//     }

//         chrome.storage.local.set({ problems : JSON.stringify([...problems]) }).then(() => {
//             console.log("mockdata removed");
//             // populateProblemsToDo().then(()=>{
//             //     populateProblemsCompleted();
//             // })
            
//           });
// }
// function AddButtonMockData(){
//     const button = document.createElement('button');
//     button.textContent = 'Add/remove mockdata to/from list';
//     button.className = 'leetcode-tracker-button-add';
//     button.title = 'Click to add the problem to list';
    
//     button.style.cssText = `
//         margin-left: 10px;
//         padding: 5px 10px;
//         background-color: #3498db;
//         color: white;
//         border: none;
//         border-radius: 4px;
//         cursor: pointer;
//         transition: background-color 0.3s ease;
//     `;

//     button.addEventListener('click', removeMockData);
    
//     let div = document.querySelector(".addbutton");
//     div.innerHTML = '';
//     div.appendChild(button);
// }
// AddButtonMockData();
