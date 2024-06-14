const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
const port = process.env.PORT||3000;
const {poolPromise} = require('./db');
app.use(cors());
const addLists = require('./addListWithCard&Characters');
const updateLists = require('./updateListWithCard&Characters');
const addCharactersWithTicks = require('./addCharacterListWithTick');
const getCharactersWithTicks = require('./getCharacterListWithTick');

// SQL Server configuration
app.use(addLists);
app.use(updateLists);
app.use(addCharactersWithTicks);
app.use(getCharactersWithTicks);

  // API endpoint to get all list names with cards and characters
  app.get('/api/lists', async (req, res)=>{
    try{

        // Query to get all lists with cards and characters
        const pool = await poolPromise;
        const result = await pool.request().query(`
    SELECT
        Lists.listName,
        Lists.listId,
        Lists.isSelectedList,
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


  // Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });