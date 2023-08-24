# Kanban_API

## Overview

### The challenge

Users should be able to create fetch requests that allow users to create, read, update, and delete boards, columns, and tasks.

### Installation

Clone the repository:

```shell
git clone https://github.com/Nat-crit20/Kanban_API.git
```

When creating a new Task or updating one be sure to use this format:

```json
{
  "Title": "Task Title",
  "Description": "task description...",
  "SubTasks": ["Subtask 1", "Subtask 2"],
  "Status": {
    "name": "In Progress",
    "columnID": "newColumnID"
  }
}
```

For a list of all the endpoints go to the [Documentation](https://nat-crit20.github.io/Kanban_API/)

## My process

### Built with

- Node.js
- Express.js
- MongoDB
- Passport

### Continued development

I would like to separate the index.js file into routes and components

## Author

- Website - [Nathan Greuel](https://nat-crit20.github.io/Portfolio_Website/)
