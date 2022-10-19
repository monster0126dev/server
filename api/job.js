const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    const job = await prisma.job.findMany();
    res.json(job);
});

router.get("/:id", async (req, res) => {
    const job = await prisma.job.findUnique({
        where: {
            id: Number(req.params.id )
        }
    });
    res.json(job);
});

router.post("/update", async (req, res) => {
    const job = await prisma.job.update({
        where: {id: Number(req.body.id)},
        data: {
            title: req.body.title,
            location: req.body.location,
            salary: req.body.salary
        }
    });
    res.json(job);
})

router.post('/add', async (req, res) => {
    const job = await prisma.job.create({ data: req.body });
    res.json(job);
})

module.exports = router;