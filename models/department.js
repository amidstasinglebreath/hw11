var connection = require("../config/connection.js");
// why didn't this work?

class department {
    // Just like constructor functions, classes can accept arguments
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }

    printInfo() {
        console.log(`ID: ${this.id}`);
        console.log(`Title: ${this.title}`);
    }
}

module.exports = department;