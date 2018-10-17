import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import Issue from './models/Issue';
import User from './models/User'

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/issues');

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

// Add new user
router.route('/users/add').post((req, res) => {
            let user = new User();
            user.username = req.body.username;
            user.tasks = [];

            user.save()
                .then(user => {
                    res.status(200).send({'message': 'done'});
                })
                .catch(err => {
                    res.status(400).send('Failed to create new record');
                });
            
});

//Get user by name 
router.route('/users/:username').get((req, res) => {
    User.find({username: req.params.username}, (err, user) => {
        if (err)
            console.log(err);
        else {
            res.json(user);
            
        }
    });
});

// Get issue by id
router.route('/issues/:id').get((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (err)
            console.log(err);
        else
            res.json(issue);
    });
});

//add new issue for user
router.route('/addissue').post((req, res) => {
    let issue = new Issue();
    issue.title = req.body.title;
    issue.description = req.body.description;
    issue.severity = req.body.severity;
    let issueId = issue._id;
    issue.save();

    User.findById(req.body.userid, (err, user) => {
        if(!user)
            return next(new Error('Could not find user'));
        else {
            let task = user.tasks;
            task.push(issueId);

            User.update(
                {_id: req.body.userid},
                {$set :
                        {
                            "tasks": task
                        }
                }
            , function(err, result){
                if(err){
                    console.log(err);
                }
                res.json('Done')
            });
        }
    });
});

// edit task
router.route('/issues/update/:id').post((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (!issue)
            return next(new Error('Could not load document'));
        else {
            console.log(req.body);
            issue.title = req.body.title;
            issue.description = req.body.description;
            issue.severity = req.body.severity;
            issue.status = req.body.status;

            issue.save().then(issue => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

router.route('/issues/delete/:id/:userid').get((req, res) => {
    Issue.findByIdAndRemove({_id: req.params.id}, (err, issue) => {
        if (err)
            console.log(err);
        else {
        User.update(
                { _id: req.params.userid },
                { $pull: 
                    { 
                    "tasks": req.params.id 
                    } 
                },
                function (err, result){
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.json('Delete success');
                    }
                }
            );
        }
    });
})

app.use('/', router);

app.listen(4000, () => console.log('Express server running on port 4000'));