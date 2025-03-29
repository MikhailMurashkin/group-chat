import express from 'express'
import moment from 'moment'

import User from '../models/User.js'
import Group from '../models/Group.js'
import GroupMatch from '../models/GroupMatch.js';
import protect from '../middleware/authMiddleware.js'
const groupRoutes = express.Router()

groupRoutes.post('/createGroup', protect, async (req, res) => {
    try {
        const { groupName, groupDescription } = req.body;

        const group = await Group.create({
            name: groupName,
            description: groupDescription,
            id: generateGroupId(),
            creator: req.user,
            participants: [req.user],
            inviteCode: generateInviteCode()
        });

        res.status(201).json({ groupId: group.id });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
})

groupRoutes.get('/getGroupsByUserId', protect, async (req, res) => {
    try {
        const groups = await Group.find({creator: req.user});

        res.json({ groups });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

groupRoutes.post('/getGroupInfoById', protect, async (req, res) => {
    try {
        await Group.findOne({id: req.body.groupId})
        .then(group => {
          let groupDoc = group._doc
          if (groupDoc.creator == req.user) {
            groupDoc.isCreator = 'true'
          }

          User.find({}).then(users => {

            let participantsExtended = []
            
            groupDoc.participants.forEach((participant) => {
              let userI = users.findIndex(u => u.id == participant)
              console.log(participant)
              participantsExtended.push({
                id: users[userI].id,
                name: users[userI].name
              })
            })
            groupDoc.participants = participantsExtended
            res.json(groupDoc);
          

          })
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

groupRoutes.post('/joinGroupByCode', protect, async (req, res) => {
    try {
        Group.findOne({inviteCode: req.body.inviteCode, participants: {$nin: [req.user] }})
        .then(group => {
          if (!group || !group.allowNewParticipants || group.complete) {
            return res.status(400).json({ message: "Can't join this group now" });
          } else {
            Group.findOneAndUpdate(
              { inviteCode: req.body.inviteCode },
              { $push: {participants: req.user} }
            ).then(
              res.status(200).json({message: "Joined!"})
            )
          }
        })
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
})

groupRoutes.post('/startGroupSearch', protect, (req, res) => {
    try {
        Group.findOneAndUpdate({id: req.body.groupId}, {
          $set: {
            complete: true,
            inSearch: true,
            description: "TEST!!"
          }
        })
        .then(group => {
          console.log(group)
          if (!group || group.creator != req.user) {
            return res.status(400).json({ message: 'No permission' });
          }
          if (group.inSearch) {
            return res.status(400).json({ message: 'Already in search' });
          }

          Group.findOneAndUpdate({inSearch: true, id: {$ne: req.body.groupId}}, {
            $set: {
              // inSearch: false,
              description: ":/"
            }
          }).then(foundGroup => {
              if (!foundGroup) {
                return res.status(200).json({ message: 'No available groups now' });
              }
              console.log(froundGroup.id)

              group.$set('inSearch', false)
              group.save().then(group => {
                const groupMatch = new GroupMatch({
                  id1: foundGroup.id,
                  id2: group.id,
                  date: moment().format("MM DD YY") 
                })
                groupMatch.save().then(groupMatch => {
                  res.status(200).json(groupMatch)
                })
              })
          })
        })
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
})



groupRoutes.get('/me', protect, async (req, res) => {
    try {
      const user = await User.findById(req.user).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
})



const generateInviteCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

const generateGroupId = () => {
    const characters = 'qwertyuiopasdfghjklzxcvbnm0123456789';
    let code = '';
    for (let i = 0; i < 33; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

export default groupRoutes;