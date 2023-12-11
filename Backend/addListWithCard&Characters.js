const express = require('express');
const router = express.Router();
const sql = require('mssql');
const {poolPromise} = require('./db');

router.post('/api/lists/addWithCardsAndCharacters', async (req, res)=>{
    try{

    console.log(req);
    debugger;
    const {listName, cardName, characters} = req.body;
    if(!listName || !cardName || !Array.isArray(characters)){
        return res.status(400).json({error: 'Invalid input'});
    }

    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    try{
        const isSelectedList = false;
        const listResult = await transaction
                .request()
                .input('listName', sql.NVarChar(100), listName)
                .input('isSelectedList', sql.Bit, isSelectedList)
                .query('INSERT INTO Lists (listName, isSelectedList) VALUES (@listName, @isSelectedList); SELECT SCOPE_IDENTITY() AS listId');
        const listId = listResult.recordset[0].listId;

        const selected = false;
        const cardResult = await transaction
                .request()
                .input('listId', sql.Int, listId)
                .input('cardName',sql.NVarChar(100), cardName)
                .input('selected', sql.Bit, selected)
                .query('INSERT INTO CARDS (listId, cardName, selected) VALUES (@listId, @cardName, @selected); SELECT SCOPE_IDENTITY() As cardId');
        const cardId = cardResult.recordset[0].cardId;

        for(const character of characters){
            await transaction
                    .request()
                    .input('cardId', sql.Int, cardId)
                    .input('characterName', sql.NVarChar(100), character.characterName)
                    .input('active', sql.Bit, character.active)
                    .input('characterValue', sql.NVarChar(100), character.characterValue)
                    .query('INSERT INTO Characters (cardId, characterName, active, characterValue) VALUES (@cardId, @characterName, @active, @characterValue)');
        }
        await transaction.commit();

      res.status(201).json({ message: 'List with card and characters added successfully' });
    }
    catch(error){
        await transaction.rollback();
        throw error;
    }
}
catch(err){
    console.error(err.message);
    res.status(500).send('Internal Server Error');
}
});

module.exports = router;