const listContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListButton = document.querySelector("[data-delete-list-button]");
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-Input]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]');

//Loading the lists that are stored in the local storage
const LOCAL_STORAGE_LIST_KEY = "task.lists";
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];


const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListsId";
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

// If any list in selected
listContainer.addEventListener("click", e => {
    if (e.target.tagName.toLowerCase() === "li") {
        selectedListId = e.target.dataset.listId;
        saveAndRender();
    }

})

// if a task is checked 
tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedList = lists.find(list => list.id === selectedListId);
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
        selectedTask.complete = e.target.checked; //checks or unchecks
        save(); //updated list
        renderTaskCount(selectedList); //re render task count depending on the current selected list
    }
})

//Whenever the clear completed button is clicked 
clearCompleteTasksButton.addEventListener('click',
    e => {
        const selectedList = lists.find(list => list.id === selectedListId);
        selectedList.tasks = selectedList.tasks.filter(task => !task.complete); //only keeping the tasks that are incomplete
        saveAndRender(); //save the updated lists and render again
    })


//if the delete list button is clicked
deleteListButton.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId);
    selectedListId = null;
    saveAndRender();
})


// EventListner for submitting the new list form 
newListForm.addEventListener('submit', e => {
    e.preventDefault();
    const listName = newListInput.value;
    if (listName == null || listName === "") return
    const list = createList(listName);
    newListInput.value = null;
    lists.push(list);
    // Whenever a new list is created we also want to save it in that local storage  and render to the page 
    saveAndRender();
})

//Create list function will inputting a new list
function createList(name) {
    return {
        id: Date.now().toString(),
        name: name,
        tasks: []
    }
}

// EventListner for submitting the new task form 
newTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value;
    if (taskName == null || taskName === "") return
    const task = createTask(taskName);
    newTaskInput.value = null;
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks.push(task);
    // Whenever a new task is created we also want to save it in that local storage and render to the page 
    saveAndRender();
})

function createTask(taskName) {
    return {
        id: Date.now().toString(),
        name: taskName,
        complete: false
    }
}


function saveAndRender() {
    save();
    render();
}

//creating a func that saves the created lists in the local storage
function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

// First it clears the creates element li with class and then adds the text and then adds it to the container
function render() {
    clearElement(listContainer);
    renderLists();

    const selectedList = lists.find(list => list.id === selectedListId);
    if (selectedListId === null || selectedList == null) {
        listDisplayContainer.style.display = "none";
    } else {
        listDisplayContainer.style.display = "";
        listTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList);
        clearElement(tasksContainer);
        renderTasks(selectedList);
    }
}

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector('input');
        checkbox.id = task.id;
        checkbox.checked = task.complete;
        const label = taskElement.querySelector('label');
        label.htmlFor = task.id;
        label.append(task.name);
        tasksContainer.appendChild(taskElement);

    })
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = (incompleteTaskCount === 1) ? "task" : "tasks";
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
    lists.forEach(list => {
        const listElement = document.createElement('li');
        listElement.dataset.listId = list.id;
        listElement.classList.add("list-name");
        listElement.innerText = list.name;
        if (selectedListId === list.id) {
            listElement.classList.add("activeList");
        }
        listContainer.appendChild(listElement);
    })
}

function clearElement(ele) {
    while (ele.firstChild) {
        ele.removeChild(ele.firstChild)
    }
}

render()