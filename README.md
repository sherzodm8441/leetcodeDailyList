02/13/2025
With this initial commit, we have uploaded an MVP for a Chrome Extension project that can be used alongside leetcode.com to study coding problems.

Once added to your set of Chrome extensions, this extension will modify the Description section of your leetcode problem on leetcode.com. 
Curent modifications include a toggle button that adds and removes the problem to and from the extention.

In the extension itself, you can mark the problem that you have added as completed. At which point it will be moved  from the TO DO section to the Completed section.
The extension will automatically add the problem back to the TO DO list after a certain number of days, encouraging you to complete the same problem again. This enables 
you to reinforce the key elements of each leetcode problem by re-completing them in a spaced retition manner. After each repeated completion, the interval between when 
the same problem shows up in the TO DO list increases (refer to code for interval specifics).

FEATURES TO COME:
  * Being able to modify the intervals for how often the same problem is added back to the TO DO list
  * Being able to add notes (or categories) to each problem to reiterate key concepts/tricks to help solve the problem 
