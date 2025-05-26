import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://realtime-database-781ea-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "shoppingList")

const inputFieldEl = document.getElementById("input-field")
const quantityFieldEl = document.getElementById("quantity-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")
const themeToggleEl = document.getElementById("theme-toggle")
const toggleIconEl = themeToggleEl.querySelector(".toggle-icon")

// Initialize theme from localStorage or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem("theme")
    
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode")
        document.documentElement.classList.add("dark-mode")
        toggleIconEl.textContent = "☀️"
    } else if (savedTheme === "light") {
        document.body.classList.remove("dark-mode")
        document.documentElement.classList.remove("dark-mode")
        toggleIconEl.textContent = "🌙"
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.body.classList.add("dark-mode")
            document.documentElement.classList.add("dark-mode")
            toggleIconEl.textContent = "☀️"
            localStorage.setItem("theme", "dark")
        } else {
            localStorage.setItem("theme", "light")
        }
    }
}

// Toggle theme
themeToggleEl.addEventListener("click", function() {
    if (document.body.classList.contains("dark-mode")) {
        document.body.classList.remove("dark-mode")
        document.documentElement.classList.remove("dark-mode")
        toggleIconEl.textContent = "🌙"
        localStorage.setItem("theme", "light")
    } else {
        document.body.classList.add("dark-mode")
        document.documentElement.classList.add("dark-mode")
        toggleIconEl.textContent = "☀️"
        localStorage.setItem("theme", "dark")
    }
})

// Initialize theme on page load
initializeTheme()

addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value.trim()
    let quantityValue = quantityFieldEl.value
    
    // Input validation
    if (inputValue === "") {
        showValidationError("Please enter an item name")
        return
    }
    
    if (quantityValue < 1) {
        showValidationError("Quantity must be at least 1")
        return
    }
    
    // Create item object with name and quantity
    const itemObj = {
        name: inputValue,
        quantity: Number(quantityValue)
    }
    
    push(shoppingListInDB, itemObj)
    
    clearInputFieldEl()
    resetValidationError()
})

// Add keyboard support for the input field
inputFieldEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addButtonEl.click()
    }
})

// Add keyboard support for the quantity field
quantityFieldEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addButtonEl.click()
    }
})

// Show validation error message
function showValidationError(message) {
    // Create error message element if it doesn't exist
    let errorEl = document.getElementById("error-message")
    if (!errorEl) {
        errorEl = document.createElement("p")
        errorEl.id = "error-message"
        errorEl.style.color = "var(--error-color)"
        errorEl.style.fontSize = "16px"
        errorEl.style.margin = "5px 0"
        errorEl.style.textAlign = "center"
        
        // Insert after the input container
        const inputContainer = document.querySelector(".input-container")
        inputContainer.parentNode.insertBefore(errorEl, inputContainer.nextSibling)
    }
    
    errorEl.textContent = message
}

// Reset validation error
function resetValidationError() {
    const errorEl = document.getElementById("error-message")
    if (errorEl) {
        errorEl.textContent = ""
    }
}

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
    
        clearShoppingListEl()
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]
            
            appendItemToShoppingListEl(currentItem)
        }    
    } else {
        shoppingListEl.innerHTML = "No items here... yet"
    }
})

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
    quantityFieldEl.value = "1"
    inputFieldEl.focus()
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0]
    let itemValue = item[1]
    
    let newEl = document.createElement("li")
    
    // Check if the item is an object (new format) or a string (old format)
    if (typeof itemValue === "object" && itemValue !== null) {
        newEl.textContent = `${itemValue.name} (${itemValue.quantity})`
    } else {
        // Handle legacy data
        newEl.textContent = itemValue
    }
    
    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        
        remove(exactLocationOfItemInDB)
    })
    
    shoppingListEl.append(newEl)
}