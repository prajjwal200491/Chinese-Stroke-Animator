require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
const port = process.env.PORT||3000;
const { getPool } = require('./db');
app.use(cors());
const addLists = require('./addListWithCard&Characters');
const updateLists = require('./updateListWithCard&Characters');
const addCharactersWithTicks = require('./addCharacterListWithTick');
const getCharactersWithTicks = require('./getCharacterListWithTick');
const updateSelections = require('./updateSelectionsList');

// SQL Server configuration
app.use(addLists);
app.use(updateLists);
app.use('/api/lists',addCharactersWithTicks);
console.log('using getCharactersWithTicks inside app.js');
app.use('/api/lists',getCharactersWithTicks);
app.use('/api/lists',updateSelections);

  // API endpoint to get all list names with cards and characters
  app.get('/api/lists', async (req, res)=>{
    try{

        // Query to get all lists with cards and characters
        const pool = await getPool();
        const result = await pool.request().query(`
    SELECT
        Lists.listName,
        Lists.listId,
        Lists.isSelectedList,
        Lists.isPublic,
        Lists.ownerId,
        Cards.cardName,
        Cards.cardId,
        Cards.selected,
        Characters.characterName,
        Characters.active,
        Characters.characterValue
      FROM Lists
      INNER JOIN Cards ON Lists.ListID = Cards.ListID
      INNER JOIN Characters ON Cards.CardID = Characters.CardID
      ORDER BY Lists.listName, Cards.cardName, Characters.characterName
  `);
  
  let listData={};
  listData = result.recordset.reduce((acc, obj)=>{
  	if(!acc.hasOwnProperty(obj.listName)){
    let values={};
    values[obj.cardName]={
    characters: [
    {active: obj.active, value: obj.characterName}
    ],
    cardname: obj.cardName,
    selected: obj.selected,
    cardId: obj.cardId
    };
    acc[obj.listName]={
    listname: obj.listName,
    listId: obj.listId,
    isSelectedList: obj.isSelectedList,
    isPublic: obj.isPublic,
    ownerId: obj.ownerId,
    values: values
    }
    }
    else{
    if(!acc[obj.listName].values.hasOwnProperty(obj.cardName)){
    	let newCard={};
      newCard[obj.cardName]={
      characters:[
      {active: obj.active, value: obj.characterName}
      ],
      cardname: obj.cardName,
      selected: obj.selected,
      cardId: obj.cardId
      }
      
      acc[obj.listName].values={
      ...acc[obj.listName].values,
      	[obj.cardName]: newCard[obj.cardName]
      }
    }
    else{
    acc[obj.listName].values[obj.cardName].characters = [
    ...acc[obj.listName].values[obj.cardName].characters,
    {active: obj.active, value: obj.characterName}
    ];
    }
    }
    return acc;
    },{});
    
    // Send the structured data as JSON
    res.json(listData);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
      }
  });


// Keep the process alive if the DB (or any async op) rejects, instead of
// crashing the whole server. Errors are logged and individual requests still
// return 500 via their own try/catch.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

  // Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });