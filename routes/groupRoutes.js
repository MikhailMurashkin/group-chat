import express from 'express'
import moment from 'moment-timezone'

import User from '../models/User.js'
import Group from '../models/Group.js'
import GroupMatch from '../models/GroupMatch.js';
import protect from '../middleware/authMiddleware.js'
const groupRoutes = express.Router()

const moscowTime = moment.tz("Europe/Moscow")

groupRoutes.post('/createGroup', protect, async (req, res) => {
    try {
        const { groupName, groupDescription } = req.body;

        const group = await Group.create({
            name: groupName,
            description: groupDescription,
            id: generateGroupId(),
            creatorId: req.user,
            participantsId: [req.user],
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
      console.log(req.user)
        const groupsCreated = await Group.find({ creatorId: req.user });
        const groupsJoined = await Group.find({
          participantsId: { $in: req.user },
          $expr: {
            $ne: [
                { $arrayElemAt: ['$participantsId', 0] },
                req.user
            ]
          }
        })
        res.json({ groupsCreated, groupsJoined });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
})

groupRoutes.post('/getGroupInfoById', protect, async (req, res) => {
    try {
        await Group.findOne({id: req.body.groupId, participantsId: {$in: req.user}})
        .then(group => {
          if (!group) {
            return res.status(400).json({ message: 'Not found or no permission' });
          }

          let groupDoc = group._doc
          if (groupDoc.creatorId == req.user) {
            groupDoc.isCreator = 'true'
          }

          User.find({}).then(users => {

            let participantsExtended = []
            
            groupDoc.participantsId.forEach((participant) => {
              let userI = users.findIndex(u => u.id == participant)
              console.log(participant)
              participantsExtended.push({
                id: users[userI].id,
                name: users[userI].name
              })
            })
            groupDoc.participants = participantsExtended


            GroupMatch.findOne({
              $or: [{groupId1: req.body.groupId}, {groupId2: req.body.groupId}],
              date: moscowTime.format('YYYY-MM-DD')
            }).then(todaysMatch => {
              if (todaysMatch) {
                if (todaysMatch.groupId1 == req.body.groupId) {
                  groupDoc.groupFoundTodayId = todaysMatch.groupId2
                }
                if (todaysMatch.groupId2 == req.body.groupId) {
                  groupDoc.groupFoundTodayId = todaysMatch.groupId1
                }
              } else {
                groupDoc.groupFoundTodayId = ""
              }
              res.json(groupDoc);
            })
          })
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

groupRoutes.post('/joinGroupByCode', protect, async (req, res) => {
    try {
        Group.findOne({inviteCode: req.body.inviteCode, participantsId: {$nin: [req.user] }})
        .then(group => {
          if (!group || group.complete) {
            return res.status(400).json({ message: "Can't join this group now" });
          } else {
            Group.findOneAndUpdate(
              { inviteCode: req.body.inviteCode },
              { $push: {participantsId: req.user} }
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
        GroupMatch.findOne({
          $or: [{groupId1: req.body.groupId}, {groupId2: req.body.groupId}],
          date: moscowTime.format('YYYY-MM-DD')
        }).then(todaysMatch => {
          if (todaysMatch) {
            console.log(todaysMatch)
            return res.status(400).json({ message: 'Group was found already today' });
          }

          Group.findOneAndUpdate({id: req.body.groupId}, {
            $set: {
              complete: true,
              inSearch: true
            }
          })
          .then(group => {
            if (!group || group.creatorId != req.user) {
              return res.status(400).json({ message: 'No permission' });
            }
            if (group.inSearch) {
              return res.status(400).json({ message: 'Already in search' });
            }
  
            Group.findOneAndUpdate({
              inSearch: true,
              id: {$ne: req.body.groupId},
              creatorId: {$ne: req.user}
            }, {
              $set: {
                inSearch: false
              }
            }).then(foundGroup => {
                if (!foundGroup) {
                  return res.status(200).json({ message: 'Searching for groups..' });
                }
                console.log("found: ", foundGroup.id)
  
                Group.findOneAndUpdate({id: req.body.groupId}, {
                  $set: {
                    inSearch: false
                  }
                }).then(group => {
                  const groupMatch = new GroupMatch({
                    groupId1: foundGroup.id,
                    groupId2: group.id,
                    date: moscowTime.format('YYYY-MM-DD')
                  })
                  groupMatch.save().then(groupMatch => {
                    res.status(200).json(groupMatch)
                  })
                })
            })
          })
        })
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
})

groupRoutes.post('/getFoundGroupInfo', protect, async (req, res) => {
  try {
    GroupMatch.findOne({
      $or: [{groupId1: req.body.foundGroupId}, {groupId2: req.body.foundGroupId}],
      date: moscowTime.format('YYYY-MM-DD')
    }).then(todaysMatch => {
      if(!todaysMatch) {
        return res.status(400).json({ message: 'Not found' })
      }

      let myGroupId = ''
      let foundGroupDecision = ''
      let myGroupDecision
      if (todaysMatch.groupId1 == req.body.foundGroupId) {
        myGroupId = todaysMatch.groupId2
        myGroupDecision = todaysMatch.groupDecision2
        foundGroupDecision = todaysMatch.groupDecision1
      }
      if (todaysMatch.groupId2 == req.body.foundGroupId) {
        myGroupId = todaysMatch.groupId1
        myGroupDecision = todaysMatch.groupDecision1
        foundGroupDecision = todaysMatch.groupDecision2
      }
      Group.findOne({id: myGroupId, participantsId: {$in: req.user}})
      .then(group => {
        if(group) {
          Group.findOne({id: req.body.foundGroupId})
          .then(foundGroup => {
            let foundGroupInfo = {
              name: foundGroup.name,
              description: foundGroup.description
            }

            if (myGroupDecision != 'No decision') {
              foundGroupInfo.foundGroupDecision = foundGroupDecision
            }
            res.status(200).json(foundGroupInfo)
          })
        } else {
          res.status(400).json({ message: 'No permission' })
        }
      })
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
})


groupRoutes.post('/foundGroupDecision', protect, async (req, res) => {
  try {
    GroupMatch.findOne({
      $or: [{groupId1: req.body.myGroupId}, {groupId2: req.body.myGroupId}],
      date: moscowTime.format('YYYY-MM-DD')
    }).then(todaysMatch => {

      console.log(req.body.decision)
      if(!todaysMatch) {
        return res.status(400).json({ message: 'Not found' })
      }

      if (todaysMatch.groupId1 == req.body.myGroupId) {
        todaysMatch.groupDecision1 = req.body.decision
      }
      if (todaysMatch.groupId2 == req.body.myGroupId) {
        todaysMatch.groupDecision2 = req.body.decision
      }

      todaysMatch.save().then(savedMatch => {
        res.status(200).json(savedMatch)
      })
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
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