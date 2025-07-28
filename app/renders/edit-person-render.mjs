import * as wp from "./../webpage.mjs";
import * as db from '../../database/db.mjs';
import logger from './../logger.mjs';

// prepare Edit one person page

export async function preparePersonEdit(id) {
    logger.silly(`One person edit page is preparing, id=${id}`);
    var pageData = wp.CleanWebpage;
    const person = await getPersonDB(id);
    pageData.breadCrumbs = [
        wp.breadCrumbs.home,
        wp.breadCrumbs.editor,
        wp.breadCrumbs.editorPersons
    ];
    pageData.showJSON = true;
    pageData.content = {
        person : person
    }
    pageData.title = person.first_name + " " + person.last_name;
    pageData.content.personForm = await preparePersonForm(person);
    logger.silly(`One person edit page has prepared, id=${id}`);
    return pageData;
};

// prepare Add Person page

export async function preparePersonAdd() {
    logger.silly(`Add person page is preparing...`);
    var pageData = wp.CleanWebpage;
    pageData.breadCrumbs = [
        wp.breadCrumbs.home,
        wp.breadCrumbs.editor,
        wp.breadCrumbs.editorPersons
    ];
    pageData.showJSON = true;
    pageData.content = {};
    pageData.title = "Добавить персону";
    pageData.content.personForm = await preparePersonForm();
    logger.silly(`Add person page has prepared`);
    return pageData;
};

// prepare Add Person - done page

export async function preparePersonHasAdded(person) {
    var fullName = `${person.firstName} ${person.lastName}`;
    logger.silly(`Person ${fullName}, ${person.uri}, ${person.selfIdentity} adding results page is preparing...`);
    var pageData = wp.CleanWebpage;
    pageData.breadCrumbs = [
        wp.breadCrumbs.home,
        wp.breadCrumbs.editor,
        wp.breadCrumbs.editorPersons
    ];
    pageData.showJSON = true;
    pageData.content = {};
    pageData.title = `Добавлена персона ${fullName}`;
    const personStored = await addPerson(person);
    pageData.content.personForm = await preparePersonForm(personStored);
    logger.silly(`Person ${fullName} adding results page has prepared`);
    return pageData;
};

// person form for both stances : with or without id (json)
async function preparePersonForm(person) {
    var m = '';
    !person ? m = 'empty' : m = `${person.first_name} ${person.last_name}`;
    logger.silly(`Person form (${m}) is preparing...`);
    var personForm = {
        formName: "Add person",
        action: "/editor/persons/add",
        method: "post",
        enctype: "multipart/form-data",
        fields: {
          firstName : {
            type: "text",
            title: "Имя",
            value: "",
            required: true
          },
          lastName : {
            type: "text",
            title: "Фамилия",
            value: "",
            required: true
          },
          selfIdentity : {
            type: "text",
            title: "как обращаться",
            value: ""
          },
          uri :{
            type: "text",
            title: "Uri",
            value: "",
            required: true
          },
          personID : {
            type: "hidden",
            title: "personID",
            value: null
          },
          submitAction : {
            type: "button",
            value: "submit",
            title: "Submit"
          }
        }
    };
    if (person) {
        personForm.formName = "Edit person",
        personForm.fields.firstName.value = person.first_name;
        personForm.fields.lastName.value = person.last_name;
        personForm.fields.uri.value = person.uri;
        personForm.fields.personID.value = person.id;
        personForm.fields.selfIdentity.value = person.self_identity;
        personForm.action = "/editor/persons/" + person.id;
    }
    logger.silly(`Person form (${m}) has prepared.`);
    return personForm;
};

export async function updatePerson(id, person) {
    var personName = `${person.firstName} ${person.lastName}`;
    logger.silly(`Preparing a person to update (${personName}).`);
    if (!person.selfIdentity||(person.selfIdentity=='')) {person.selfIdentity = 'he/him'};
    logger.silly(`Processed selfIdentity is '${person.selfIdentity}'.`);
    var updatedPersonData = await updatePersonDB(
        id,
        person.firstName,
        person.lastName,
        person.uri,
        person.selfIdentity,
        personName
    );
    const result = 1;
    logger.silly(`Person updated.`);
    return result;
};

async function addPerson(person) {
    var personName = `${person.firstName} ${person.lastName}`;
    logger.silly(`Preparing a new person to store (${personName}).`);
    if (!person.selfIdentity||(person.selfIdentity=='')) {person.selfIdentity = 'he/him'};
    logger.silly(`Processed selfIdentity is '${person.selfIdentity}'.`);
    console.log(person);
    var storedPersonData = await addPersonDB(
        person.firstName,
        person.lastName,
        person.uri,
        person.selfIdentity,
        personName
    );
    const result = storedPersonData.rows[0];
    logger.silly(`A new person stored, id is ${result.id}.`);
    return result;
};

export async function deletePerson(id) {
    logger.silly(`Preparing a person to delete, id ${id}.`);
    const result = await deletePersonDB(id);
    logger.silly(`Person deleted, id ${id}.`);
};


async function addPersonDB(firstName, lastName, uri, selfIdentity, personName) {
    logger.silly(`Store new person in DB (${firstName} : ${lastName} : ${uri} : ${selfIdentity} : ${personName})...`);
    const query = {
        text: `INSERT INTO persons (first_name, last_name, uri, self_identity, person_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, first_name, last_name, uri, self_identity;`,
        values: [firstName, lastName, uri, selfIdentity, personName]
    };
    const result = await db.queryDB(query);
    logger.silly(`Stored new person in DB (${JSON.stringify(result.rows[0])}).`);
    return result;
};

async function updatePersonDB(id, firstName, lastName, uri, selfIdentity, personName) {
    logger.silly(`Update person in DB (${id} : ${firstName} : ${lastName} : ${uri} : ${selfIdentity} : ${personName})...`);
    const query = {
        text: `UPDATE persons 
        SET first_name = $1, last_name = $2, uri = $3, self_identity = $4, person_name = $5
        WHERE id = $6;`,
        values: [firstName, lastName, uri, selfIdentity, personName, id]
    };
    const result = await db.queryDB(query);
    logger.silly(`Updated person in DB.`);
    return result;
};

async function deletePersonDB(id) {
    const query = {
        text: `DELETE FROM collaborators WHERE person_id = ${id};
        DELETE FROM persons where id = ${id};`,
    };
    const result = await db.queryDB(query);
    return result;
};

async function getPersonDB(id) {
  const query = {
    text: `SELECT * FROM persons WHERE id = $1;`,
    values: [id]
  }
  const result = await db.queryDB(query);
  return result.rows[0];
};
