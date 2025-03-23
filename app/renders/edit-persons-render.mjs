import * as wp from "./../webpage.mjs";
import * as db from '../../database/db.mjs';

// persons list

export async function preparePersonsList() {
    var pageData = wp.CleanWebpage;
    pageData.breadCrumbs = [
        wp.breadCrumbs.home,
        wp.breadCrumbs.editor
    ];
    pageData.pageMenu = [
        {
          itemName : "добавить персону",
          itemUrl : "add/"
         }
      ];
    pageData.title = "Персоны";
    pageData.content = {};
    pageData.content.persons = await getPersonsListDB();
    return pageData;
}

// prepare Edit one person page

export async function preparePersonEdit(id) {
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
    return pageData;
};

// prepare Add Person page

export async function preparePersonAdd() {
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
  return pageData;
};

// person form for both stances : with or without id (json)
async function preparePersonForm(person) {
    var personForm = {
        formName: "Add person",
        action: "/editor/persons/add",
        method: "post",
        enctype: "multipart/form-data",
        fields: {
          firstName : {
            type: "text",
            title: "Имя",
            value: ""
          },
          lastName : {
            type: "text",
            title: "Фамилия",
            value: ""
          },
          uri :{
            type: "text",
            title: "Uri",
            value: ""
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
        personForm.action = "/editor/persons/" + person.id + "/";
    }
    return personForm;
}

async function getPersonsListDB() {
    const result = await db.queryDB('SELECT * FROM persons ORDER BY last_name ASC;');
    return result.rows;
};

async function getPersonDB(id) {
  const query = {
    text: `SELECT * FROM persons WHERE id = $1;`,
    values: [id]
  }
  const result = await db.queryDB(query);
  return result.rows[0];
}