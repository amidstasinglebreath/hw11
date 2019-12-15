Drop database if exists team_DB;
create database team_DB;

use team_DB;

create table department (
    id INT NOT NULL auto_increment,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

create table role (
    id INT NOT NULL auto_increment,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id),
    PRIMARY KEY (id)
);
 
create table employee (
    id INT not NULL auto_increment,
    first_name VARCHAR(30) not NULL,
    last_name VARCHAR(30) not NULL,
    role_id INT NOT NULL,
    manager_id INT NULL,
    FOREIGN KEY (role_id) REFERENCES role(id),
    PRIMARY KEY (id)
);