const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postsController = require('../controllers/postsController');
const { protect } = require('../middleware/auth');

// Validation rules
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
];

// Routes
router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPost);
router.post('/', protect, postValidation, postsController.createPost);
router.put('/:id', protect, postValidation, postsController.updatePost);
router.delete('/:id', protect, postsController.deletePost);

module.exports = router;
