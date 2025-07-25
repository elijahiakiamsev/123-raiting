import * as wp from "./../webpage.mjs";
import logger from './../logger.mjs';
import * as db from '../../database/db.mjs';

// persons list

export async function preparePersonsList() {
    logger.silly(`Persons list is preparing...`);
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
    logger.silly(`Persons list prepared`);
    return pageData;
}

async function getPersonsListDB() {
    logger.silly(`Persons list is getting form DB...`);
    const result = await db.queryDB('SELECT * FROM persons ORDER BY last_name ASC;');
    logger.silly(`Persons list has delivered from DB.`);
    return result.rows;
};
