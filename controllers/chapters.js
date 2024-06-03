const { syllabusPool } = require('../config/dbconfig'); // Adjust the path accordingly

const Chapters = async (req, res, next) => {
    const { subjectCode } = req.query;

    if (!subjectCode) {
        return res.status(400).json({ error: 'Subject code parameter is required' });
    }

    try {
        const sql = `
            SELECT 
                chapter.chapter_id,
                chapter.chapter_name
            FROM 
                chapter
            INNER JOIN
                ${process.env.DB_NAME}.Subject s ON chapter.subject_code_prefixed = s.subject_code_prefixed
            WHERE 
                s.subject_code_prefixed = ?`;

        const [chapters] = await syllabusPool.query(sql, [subjectCode]);
        res.json(chapters);
    } catch (err) {
        console.error('Error fetching chapters:', err);
        res.status(500).json({ error: 'Error fetching chapters' });
    }
};

const ChapterContent = async (req, res, next) => {
    const { chapterId } = req.query;

    if (!chapterId) {
        return res.status(400).json({ error: 'Chapter ID is required' });
    }

    try {
        const query = `
            SELECT 
                c.chapter_name,
                p.point_id,
                p.point_name,
                p.point_text,
                p.point_image
            FROM 
                chapter c
            JOIN Points p ON c.chapter_id = p.chapter_id
            WHERE 
                c.chapter_id = ?;
        `;

        const [rows] = await syllabusPool.query(query, [chapterId]);

        const chapterDetails = {
            chapter_id: chapterId,
            points: rows.map(row => ({
                point_id: row.point_id,
                point_name: row.point_name,
                point_text: row.point_text,
                point_image: row.point_image ? row.point_image.toString('base64') : null
            }))
        };

        res.json(chapterDetails);
    } catch (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { Chapters, ChapterContent };
