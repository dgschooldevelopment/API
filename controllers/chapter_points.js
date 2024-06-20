const { syllabusPool } = require('../config/dbconfig'); 

const chapterPoints = async (req, res) => {
    const { subject_code_prefixed } = req.query;

    if (!subject_code_prefixed) {
        return res.status(400).json({ error: "subject_code_prefixed is missing in the request query" });
    }

    try {
        // Fetch chapters based on subject_code_prefixed
        const [chapters] = await syllabusPool.query(
            'SELECT chapter_id, chapter_name FROM chapter WHERE subject_code_prefixed =?', 
            [subject_code_prefixed]
        );
        // Fetch points that belong to the fetched chapters
        const chapterIds = chapters.map(chapter => chapter.chapter_id);
        let points = [];
        if (chapterIds.length > 0) {
            const [pointsResult] = await syllabusPool.query(
                'SELECT chapter_id, point_id, point_name FROM Points WHERE chapter_id IN (?)', 
                [chapterIds]
            );
            points = pointsResult;
        }
        // Map points to their corresponding chapters
        const chapterMap = chapters.reduce((map, chapter) => {
            map[chapter.chapter_id] = {
                chapter_id: chapter.chapter_id,
                chapter_name: chapter.chapter_name,
                points: []
            };
            return map;
        }, {});

        points.forEach(point => {
            if (chapterMap[point.chapter_id]) {
                chapterMap[point.chapter_id].points.push({ 
                    point_id: point.point_id, 
                    point_name: point.point_name 
                });
            }
        });

        const result = Object.values(chapterMap);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    chapterPoints
};
