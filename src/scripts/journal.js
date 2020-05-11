import entries from "./entriesDOM.js";
import fieldset from "./fieldset.js";
import API from "./data.js";

// Dynamically populating the DOM
fieldset.writeDom();

// Obtaining a reference to the .entryLog container
const entriesHolder = document.querySelector(".entryLog");

// Event listener for recording a new journal entry
document.querySelector("#submitBtn").addEventListener("click", function () {
  event.preventDefault();
  let hiddenJournalId = document.querySelector("#journalId").value;
  if (hiddenJournalId != "") {
    editJournal(hiddenJournalId);
  } else if (hiddenJournalId == "") {
    let date = document.querySelector("#journalDate").value;
    let concepts = document.querySelector("#conceptsCovered").value;
    let entry = document.querySelector("#journalEntry").value;
    let mood = document.querySelector("#mood").value;
    let newJournalEntry = createEntry(date, concepts, entry, mood);
    let regex = /^[(){};:,\w\s]+$/;
    if (date == "" || concepts == "" || entry == "" || mood == "") {
      alert("Please fill out all fields.");
    } else if (!regex.test(concepts) || !regex.test(entry)) {
      alert("Please only use allowed characters. A-Z, 0-9, (), {}, :, and ;.");
    } else {
      alert("Success!");
      API.saveJournalEntry(newJournalEntry);
      entriesArr = [];
      entriesArr.push(newJournalEntry);
      entries.renderJournalEntries(entriesArr);
    }
  }
});

// Event listener for word count
let conceptsInput = document.querySelector("#conceptsCovered");
conceptsInput.addEventListener("keyup", function () {
  document.querySelector("#wordCount").innerHTML = 0;
  let words = conceptsInput.value.match(/\b[-?(\w+)?]+\b/gi);
  if (words) {
    if (words.length >= 10) {
      alert("Please reduce word count.");
    } else {
      document.querySelector("#wordCount").innerHTML = words.length;
    }
  } else {
    document.querySelector("#wordCount").innerHTML = 0;
  }
});

// Filtering journal entry by mood
let radioButton = document.querySelectorAll('input[type="radio"');
radioButton.forEach((button) =>
  button.addEventListener("click", () => {
    entriesHolder.innerHTML = "";
    let mood = event.target.value;
    API.getJournalEntries().then((entry) => {
      let filtered = entry.filter((entry) => entry.mood == mood);
      entries.renderJournalEntries(filtered);
    });
  })
);

//
entriesHolder.addEventListener("click", () => {
  if (event.target.id.startsWith("delete--")) {
    let journalId = event.target.id.split("--")[1];
    entriesHolder.innerHTML = "";
    API.deleteJournalEntry(journalId).then(loadContent);
  }
});

const createEntry = (date, concepts, content, mood) => ({
  date,
  concepts,
  content,
  mood,
});

// Rendering journal entries
function loadContent() {
  entriesHolder.innerHTML = "";
  API.getJournalEntries().then(entries.renderJournalEntries);
}

// Event listener for editing forms
entriesHolder.addEventListener("click", function () {
  if (event.target.id.startsWith("edit--")) {
    let journalToEdit = event.target.id.split("--")[1];
    updateFormFields(journalToEdit);
  }
});

const updateFormFields = (journalId) => {
  API.getJournalById(journalId).then((entry) => {
    prepopulateForm(entry);
  });
};

function prepopulateForm(entry) {
  let hiddenFormId = document.querySelector("#journalId");
  let dateInput = document.querySelector("#journalDate");
  let conceptsInput = document.querySelector("#conceptsCovered");
  let entryInput = document.querySelector("#journalEntry");
  let moodInput = document.querySelector("#mood");
  hiddenFormId.value = entry.id;
  dateInput.value = entry.date;
  conceptsInput.value = entry.concepts;
  entryInput.value = entry.entry;
  moodInput.value = entry.mood;
}

const editJournal = (id) => {
  const updatedObject = {
    date: document.querySelector("#journalDate").value,
    concepts: document.querySelector("#conceptsCovered").value,
    entry: document.querySelector("#journalEntry").value,
    mood: document.querySelector("#mood").value,
  };

  API.editJournalEntry(id, updatedObject).then(() => {
    document.querySelector("#journalId").value = "";
    loadContent();
  });
};
loadContent();

// Event listener for searching
document.querySelector("#search").addEventListener("keyup", (event) => {
  let searchTerm = event.target.value;
  let allEntries = [];
  if (event.keyCode == 13 && searchTerm != "") {
    entriesHolder.innerHTML = ""
    API.getJournalEntries().then((eachEntry) => {
      eachEntry.forEach((entry) => {
        for (let value of Object.values(entry)) {
          if (value.toString().toLowerCase().includes(searchTerm)) {
            allEntries.push(entry);
          }
        }
      });
      let foundEntries = [...new Set(allEntries)];
      entries.renderJournalEntries(foundEntries)
    });
  } else {
    loadContent()
  }
});
