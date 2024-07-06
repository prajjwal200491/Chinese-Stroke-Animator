const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('./db');

router.put('/updateSelections', async (req, res) => {
    try {

        console.log(req);
        debugger;

        const { updatedListId, updatedCardId, updatedCharacterValue } = req.body;
        if (!updatedListId || !updatedCardId || !updatedCharacterValue) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const pool = await poolPromise;
        const transaction = pool.transaction();
        await transaction.begin();

        try {

            const listResultRow = await transaction
                .request()
                .query('SELECT * FROM lists where isSelectedList = 1');
            const listId = listResultRow.recordset[0].listId;
            const cardResultRow = await transaction
                .request()
                .query('SELECT * FROM Cards where selected = 1');
            const cardId = cardResultRow.recordset[0].cardId;
            const characterResultRow = await transaction
                .request()
                .query('SELECT * FROM Characters where active = 1');
            const characterId = characterResultRow.recordset[0].characterId;
            const isSelectedList = 0;
            const selected = 0;
            const active = 0;

            await transaction
                .request()
                .input('listId', sql.Int, listId)
                .input('isSelectedList', sql.Bit, isSelectedList)
                .input('cardId', sql.Int, cardId)
                .input('selected', sql.Bit, selected)
                .input('characterId', sql.Int, characterId)
                .input('active', sql.Bit, active)
                .query(`UPDATE lists SET isSelectedList=@isSelectedList WHERE listId=@listId`)
                .query(`UPDATE Cards SET selected=@selected WHERE cardId=@cardId`)
                .query(`UPDATE Characters SET active=@active WHERE characterId=@characterId`);

            const updatedCharacterRow =await transaction
                 .request()
                 .input('updatedCharacterValue', sql.NVarChar(100), updatedCharacterValue)
                 .query(`SELECT * FROM Characters WHERE characterName=@updatedCharacterValue`);
            const updatedCharacterId = updatedCharacterRow.recordset[0].characterId;
            const updatedIsSelectedList = 1;
            const updatedIsSelected = 1;
            const updatedActive = 1;

            await transaction
                .request()
                .input('updatedListId', sql.Int, updatedListId)
                .input('updatedIsSelectedList', sql.Bit, updatedIsSelectedList)
                .input('updatedCardId', sql.Int, updatedCardId)
                .input('updatedIsSelected', sql.Bit, updatedIsSelected)
                .input('updatedCharacterId', sql.Int, updatedCharacterId)
                .input('updatedActive', sql.Bit, updatedActive)
                .query(`UPDATE lists SET isSelectedList=@updatedIsSelectedList WHERE listId=@updatedListId`)
                .query(`UPDATE Cards SET selected=@updatedIsSelected WHERE cardId=@updatedCardId`)
                .query(`UPDATE Characters SET active=@updatedActive WHERE characterId=@updatedCharacterId`);


            await transaction.commit();

            res.status(201).json({ message: 'Selections updated successfully' });

        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;