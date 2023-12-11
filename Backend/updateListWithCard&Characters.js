const express = require('express');
const router = express.Router();
const sql = require('mssql');
const {poolPromise} = require('./db');

router.put('/api/lists/updateWithListCardsAndCharacters', async (req, res)=>{
    try{

    debugger;
    const {listName, listId, cardName, cardId, characters} = req.body;
    if(!listName || !listId || !cardName || !Array.isArray(characters)){
        return res.status(400).json({error: 'Invalid input'});
    }

    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    try{
        
            const listResult = await transaction
                .request()
                .input('listName', sql.NVarChar(100), listName)
                .query(`SELECT listName FROM Lists WHERE listName=@listName`);
            if(!listResult.recordset.length>0){
                await transaction
                .request()
                .input('listName', sql.NVarChar(100), listName)
                .input('listId', sql.Int, listId)
                .query(`UPDATE Lists SET listName=@listName WHERE listId=@listId`);
            }
            if(cardId){
                const cardResult = await transaction    
                        .request()
                        .input('cardId', sql.Int, cardId)
                        .input('cardName', sql.NVarChar(100), cardName)
                        .query(`SELECT cardName FROM Cards WHERE cardId=@cardId AND cardName=@cardName`);
               if(!cardResult.recordset.length>0){
                await transaction
                .request()
                .input('cardId', sql.Int, cardId)
                .input('cardName', sql.NVarChar(100), cardName)
                .query(`UPDATE Cards SET cardName=@cardName WHERE cardId=@cardId`);
               } 
               
                for(const character of characters){
                    const characterResult = await transaction   
                        .request()
                        .input('cardId', sql.Int, cardId)
                        .input('characterName', sql.NVarChar(100), character.characterName)
                        .query(`SELECT characterName FROM Characters WHERE characterName=@characterName AND cardId=@cardId`);
                    if(!characterResult.recordset.length>0){
                        await transaction
                    .request()
                    .input('cardId', sql.Int, cardId)
                    .input('characterName', sql.NVarChar(100), character.characterName)
                    .input('active', sql.Bit, character.active)
                    .input('characterValue', sql.NVarChar(100), character.characterValue)
                    .query('INSERT INTO Characters (cardId, characterName, active, characterValue) VALUES (@cardId, @characterName, @active, @characterValue)');
                    }

                }
            }   
            else{
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
            }
            
            
        
        
        await transaction.commit();

      res.status(201).json({ message: 'List with card and characters updated successfully' });
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