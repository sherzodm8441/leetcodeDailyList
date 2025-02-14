// chrome.runtime.onMessage.addListener((obj, sender, response) => {
//     const { type, url, tabId } = obj;

//     if (type === "NEW") {
//         console.log(url)
//     } 
//     });

    console.log(getDate());

function checkForElement() {
    const titleElement = document.querySelector('.text-title-large');
    if (titleElement) {
        return titleElement.textContent;
        // console.log(document.location.href);
    } else {
        // Try again after a short delay
        setTimeout(checkForElement, 0);
    }
}


function fetchProblems(){
    return new Promise(resolve => {
        chrome.storage.local.get(["problems"], (obj) => {
            resolve(obj["problems"] ? JSON.parse(obj["problems"]) : [])
        })
    }) 
}

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

async function addNewProblemEventHandler(){
    let problems = await fetchProblems();

    let title = checkForElement();
    const id = title.split(".")[0];
    const url = document.location.href;
    let date = getDate()
    
    const newProblem = {
        title : title,
        id : id,
        url : url,
        dateAdded : date,
        datesCompleted : []
    };
    console.log(newProblem)
    chrome.storage.local.set({ problems : JSON.stringify([newProblem, ...problems]) }).then(() => {
        console.log("Value is set");
        addTrackerButton();
      });
}


function createAddButton(){
    const button = document.createElement('button');
    button.textContent = 'Add to List';
    button.className = 'leetcode-tracker-button-add';
    button.title = 'Click to add the problem to list';
    
    button.style.cssText = `
        margin-left: 10px;
        padding: 5px 10px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    `;

    button.addEventListener('click', addNewProblemEventHandler);
    
    return button;
}

async function removeProblemEventHandler(){
    let problems = await fetchProblems();

    let title = checkForElement();
    const id = title.split(".")[0];

    let filtered = problems.filter(function(prob) {
        return prob["id"] !== id;
    });
    
    chrome.storage.local.set({ problems : JSON.stringify([...filtered]) }).then(() => {
        console.log("Value is removed");
        addTrackerButton();
      });
}

function createRemoveButton(){
    const button = document.createElement('button');
    button.textContent = 'Remove from List';
    button.className = 'leetcode-tracker-button-remove';
    button.title = 'Click to remove the problem from list';
    
    button.style.cssText = `
        margin-left: 10px;
        padding: 5px 10px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    `;

    button.addEventListener('click', removeProblemEventHandler);
    
    return button;
}


function addTrackerButton() {
    //Using a more general class-based selector that's stable across reloads
    // function findTargetElement() {
    //     const elements = document.querySelectorAll('div.flex.gap-1');
    //     return Array.from(elements).find(el => 
    //         el.closest('div.flex.w-full.flex-1.flex-col.gap-4')
    //     );
    // }
    
    function findTargetElement() {
        
        targetElement = document.querySelector("div.flex.w-full.flex-1.flex-col.gap-4.overflow-y-auto.px-4.py-5 > div.flex.gap-1");

        
        return targetElement;
    }


    async function tryAddButton() {
        const targetElement = findTargetElement();

        if (!targetElement) return false;

        let problems = await fetchProblems();
    
        let title = checkForElement();
        
        const id = title.split(".")[0];

        let button = null;

        let isInList = problems.some(problem => problem["id"] === id);
        
        if (targetElement && targetElement.querySelector('.leetcode-tracker-button-add')) {
            targetElement.querySelector('.leetcode-tracker-button-add').remove();
            console.log("remove existing add button")
        }

        if (targetElement && targetElement.querySelector('.leetcode-tracker-button-remove')) {
            targetElement.querySelector('.leetcode-tracker-button-remove').remove();
            console.log("remove existing remove button")
        }

        if(isInList){
            button = createRemoveButton();
            
        }else{
            button = createAddButton();
            
        }

        
        if (targetElement) {
            targetElement.appendChild(button);
            return true;
        }
        return false;
    }

    // Try to add button for up to 5 seconds (10 attempts, 500ms apart)
    let attempts = 0;
    const maxAttempts = 10;
    
    const attemptInterval = setInterval(() => {
        if (tryAddButton() || ++attempts >= maxAttempts) {
            clearInterval(attemptInterval);
            if (attempts >= maxAttempts) {
                console.error('Failed to add button after maximum attempts');
            }
        }
    }, 500);
}

addTrackerButton();

