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

async function getPersonsListDB() {
    const result = await db.queryDB('SELECT * FROM persons ORDER BY last_name ASC;');
    return result.rows;
};
