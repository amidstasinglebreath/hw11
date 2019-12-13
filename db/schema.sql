Drop database if exists team_DB;
create database team_DB;

use team_DB;

create table department (
    id INT NOT NULL auto_increment,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

create table role (
    id INT not null auto_increment,
    title varchar(30),
    salary decimal,
    department_id int not null,
    FOREIGN KEY (department_id) REFERENCES department(id),
    PRIMARY KEY (id)
);

create table employee (
    id INT not null auto_increment,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int not null,
    manager_id int null,
    FOREIGN KEY (role_id) REFERENCES role(id),
    PRIMARY KEY (id)
);