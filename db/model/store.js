const mongoose = require("mongoose");
// const _ = require("lodash");
// const { ObjectId } = require("mongodb");

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  openTime: {
    type: Number,
    required: true,
    trim: true
  },
  closeTime: {
    type: Number,
    required: true,
    trim: true
  },
  messageBoard: {
    managerMessage: {
      message: {
        type: String
      },
      timeStamp: {
        type: Number,
        required: true
      },
      username: {
        type: String,
        required: true
      }
    },
    frontMessage: {
      message: {
        type: String
      },
      timeStamp: {
        type: Number
      },
      username: {
        type: String,
        required: true
      }
    },
    kitchenMessage: {
      message: {
        type: String
      },
      timeStamp: {
        type: Number
      },
      username: {
        type: String,
        required: true
      }
    }
  },
  Schedual: [
    {
      weeklySchedual: {
        username: {
          type: String,
          required: true
        },
        workdays: [
          {
            date: {
              type: Number,
              required: true
            },
            startTime: {
              type: Number,
              required: true
            },
            offTime: {
              type: Number,
              required: true
            },
            estimatePeriod: {
              type: Number,
              required: true
            }
          }
        ]
      }
    }
  ],
  formula: [
    {
      formulaName: {
        type: String,
        required: true
      },
      formulaMaker: [
        {
          username: {
            type: String
          }
        }
      ]
    }
  ]
});

StoreSchema.statics = {
  editMessageBoard(
    belongStore,
    userrole,
    messageField,
    messageContent,
    timeStamp,
    username
  ) {
    return new Promise((resolve, reject) => {
      //先进行用户权限和所尝试修改的留言板进行判断
      let changeMessageBoard = function() {
        if (messageField === "kitchenMessage") {
          Store.findByIdAndUpdate(belongStore, {
            $set: {
              "messageBoard.kitchenMessage": {
                message: messageContent,
                timeStamp: timeStamp,
                username: username
              }
            }
          })
            .then(doc => {
              //成功之后的对数据库的操作记录
              console.log(doc);
              resolve("Message successful added");
            })
            .catch(e => {
              reject(`Error when trying to update message board ${e}`);
            });
        } else if (messageField === "frontMessage") {
          Store.findByIdAndUpdate(belongStore, {
            $set: {
              "messageBoard.frontMessage": {
                message: messageContent,
                timeStamp: timeStamp,
                username: username
              }
            }
          })
            .then(doc => {
              //成功之后的对数据库的操作记录
              console.log(doc);
              resolve("Message successful added");
            })
            .catch(e => {
              reject(`Error when trying to update message board ${e}`);
            });
        } else if (messageField === "managerMessage") {
          Store.findByIdAndUpdate(belongStore, {
            $set: {
              "messageBoard.managerMessage": {
                message: messageContent,
                timeStamp: timeStamp,
                username: username
              }
            }
          })
            .then(doc => {
              //成功之后的对数据库的操作记录
              console.log(doc);
              resolve("Message successful added");
            })
            .catch(e => {
              reject(`Error when trying to update message board ${e}`);
            });
        } else {
          reject(`Cannot know the manager field typed in ${e}`);
        }
      };
      if (userrole.kitchen && messageField === "kitchenMessage") {
        changeMessageBoard();
        //修改厨房
      } else if (userrole.front && messageField === "frontMessage") {
        changeMessageBoard();
        //修改前台
      } else if (userrole.manager && messageField) {
        if (
          messageField === "kitchenMessage" ||
          messageField === "frontMessage" ||
          messageField === "managerMessage"
        ) {
          changeMessageBoard();
          //修改 manager, kitchen, front
        } else {
          reject(`messageField wrond ${e}`);
        }
      } else {
        reject(` No rights to change message board`);
      }
    });
  }
};

const Store = mongoose.model("Store", StoreSchema);

module.exports = {
  Store
};
