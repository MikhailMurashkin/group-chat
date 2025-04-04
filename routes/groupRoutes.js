import express from 'express'
import moment from 'moment-timezone'

import User from '../models/User.js'
import Group from '../models/Group.js'
import GroupMatch from '../models/GroupMatch.js';
import Chat from '../models/Chat.js';
import protect from '../middleware/authMiddleware.js'
const groupRoutes = express.Router()

const moscowTime = moment.tz("Europe/Moscow")

groupRoutes.post('/createGroup', protect, async (req, res) => {
    try {
        const { groupName, groupDescription } = req.body;

        const group = await Group.create({
            name: groupName,
            description: groupDescription,
            id: generateId(),
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


            Chat.findOne({
              $or: [{groupId1: req.body.groupId}, {groupId2: req.body.groupId}],
              isActive: true
            }).then(chat => {
              if (chat) {
                if (chat.groupId1 == req.body.groupId) {
                  groupDoc.groupFoundId = chat.groupId2
                }
                if (chat.groupId2 == req.body.groupId) {
                  groupDoc.groupFoundId = chat.groupId1
                }
                groupDoc.chat = true
                res.json(groupDoc)
              } else {
                GroupMatch.findOne({
                  $or: [{groupId1: req.body.groupId}, {groupId2: req.body.groupId}],
                  date: moscowTime.format('YYYY-MM-DD')
                }).then(todaysMatch => {
                  if (todaysMatch) {
                      if (todaysMatch.groupId1 == req.body.groupId) {
                        groupDoc.groupFoundId = todaysMatch.groupId2
                        groupDoc.myDecision = todaysMatch.groupDecision1
                      }
                      if (todaysMatch.groupId2 == req.body.groupId) {
                        groupDoc.groupFoundId = todaysMatch.groupId1
                        groupDoc.myDecision = todaysMatch.groupDecision2
                      }
                      res.json(groupDoc)
                  } else {
                    res.json(groupDoc)
                  }
                })
              }
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
            ).then(group => {
              res.status(200).json({groupId: group.id})
            })
          }
        })
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

groupRoutes.post('/updateGroupDescription', protect, async (req, res) => {
    try {
        Group.findOneAndUpdate({id: req.body.groupId, creatorId: req.user }, {
          description: req.body.description
        })
        .then(group => {
          if (!group) {
            return res.status(400).json({ message: "No permission" })
          } else {
            res.status(200).json({message: "Updated!"})
          }
        })
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

groupRoutes.post('/startGroupSearch', protect, (req, res) => {
    try {
        GroupMatch.findOne({
          $or: [{groupId1: req.body.groupId}, {groupId2: req.body.groupId}],
          date: moscowTime.format('YYYY-MM-DD')
        }).then(todaysMatch => {
          if (todaysMatch) {
            return res.status(400).json({
              message: 'A group have been found today already'
            });
          }

          Chat.findOne({
            $or: [{groupId1: req.body.groupId}, {groupId2: req.body.groupId}],
            isActive: true
          }).then(chat => {
            if (chat) {
              return res.status(400).json({
                message: 'You have an active chat already'
              })
            } else {
              Group.findOneAndUpdate({id: req.body.groupId}, {
                $set: {
                  complete: true,
                  inSearch: true,
                  searchDate: Date.now()
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
                }, { upsert: false, sort: { 'searchDate': 1 } }).then(foundGroup => {
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
            }
          })
        })
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
})

groupRoutes.post('/getFoundGroupInfo', protect, async (req, res) => {
  try {
    Chat.findOne({
      $or: [{groupId1: req.body.foundGroupId}, {groupId2: req.body.foundGroupId}],
      isActive: true
    }).then(chat => {
      GroupMatch.findOne({
        $or: [{groupId1: req.body.foundGroupId}, {groupId2: req.body.foundGroupId}],
        date: moscowTime.format('YYYY-MM-DD')
      }).then(todaysMatch => {
        if(!todaysMatch && !chat) {
          return res.status(400).json({ message: 'Not found' })
        }
  
        if (chat) {
          let myGroupId = ''
          if (chat.groupId1 == req.body.foundGroupId) {
            myGroupId = chat.groupId2
          }
          if (chat.groupId2 == req.body.foundGroupId) {
            myGroupId = chat.groupId1
          }
          
          console.log("myGroupId ", myGroupId)
          Group.findOne({id: myGroupId, participantsId: {$in: req.user}})
          .then(group => {
            if(group) {
              Group.findOne({id: req.body.foundGroupId})
              .then(foundGroup => {
                let foundGroupInfo = {
                  name: foundGroup.name,
                  description: foundGroup.description
                }
                res.status(200).json(foundGroupInfo)
              })
            } else {
              res.status(400).json({ message: 'No permission' })
            }
          })
        } else {
          let myGroupId = ''
          let foundGroupDecision
          let myGroupDecision = null
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
    
                if (myGroupDecision == true) {
                  foundGroupInfo.foundGroupDecision = foundGroupDecision
                }
                res.status(200).json(foundGroupInfo)
              })
            } else {
              res.status(400).json({ message: 'No permission' })
            }
          })
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
        if (savedMatch.groupDecision1 && savedMatch.groupDecision2) {
          Chat.findOne({
            $or: [{groupId1: todaysMatch.groupId1}, {groupId1: todaysMatch.groupId2}],
            $or: [{groupId2: todaysMatch.groupId1}, {groupId2: todaysMatch.groupId2}],
            isActive: true
          }).then(chat => {
            if (chat) {
              res.status(400).json({message: 'Chat already created'})
            } else {
              let chat = new Chat({
                groupId1: todaysMatch.groupId1,
                groupId2: todaysMatch.groupId2,
                isActive: true
              })
              chat.save().then(chat => {
                res.status(200).json(savedMatch)
              })
            }
        })
        } else {
          res.status(200).json(savedMatch)
        }
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

const generateId = () => {
    const characters = 'qwertyuiopasdfghjklzxcvbnm0123456789';
    let code = '';
    for (let i = 0; i < 33; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

export default groupRoutes