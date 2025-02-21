const db = require('../models');
const Users = db.users;

const Tasks = db.tasks;

const Boards = db.boards;

const TasksData = [
  {
    title: 'Complete project report',

    description:
      'Finish the final report for the project and submit it to the manager.',

    status: 'InProgress',

    start_date: new Date('2023-10-01T09:00:00Z'),

    end_date: new Date('2023-10-05T17:00:00Z'),

    likes_count: 5,
  },

  {
    title: 'Update website content',

    description:
      'Revise the homepage content to reflect the new product launch.',

    status: 'Done',

    start_date: new Date('2023-10-02T10:00:00Z'),

    end_date: new Date('2023-10-04T15:00:00Z'),

    likes_count: 3,
  },

  {
    title: 'Prepare presentation slides',

    description: 'Create slides for the upcoming client meeting.',

    status: 'ToDo',

    start_date: new Date('2023-09-28T08:00:00Z'),

    end_date: new Date('2023-09-30T12:00:00Z'),

    likes_count: 7,
  },

  {
    title: 'Organize team meeting',

    description: 'Schedule and organize the weekly team meeting.',

    status: 'InProgress',

    start_date: new Date('2023-10-03T11:00:00Z'),

    end_date: new Date('2023-10-03T12:00:00Z'),

    likes_count: 6,
  },
];

const BoardsData = [
  {
    // type code here for "relation_one" field
  },

  {
    // type code here for "relation_one" field
  },

  {
    // type code here for "relation_one" field
  },

  {
    // type code here for "relation_one" field
  },
];

async function associateBoardWithUser() {
  const relatedUser0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Board0 = await Boards.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Board0?.setUser) {
    await Board0.setUser(relatedUser0);
  }

  const relatedUser1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Board1 = await Boards.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Board1?.setUser) {
    await Board1.setUser(relatedUser1);
  }

  const relatedUser2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Board2 = await Boards.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Board2?.setUser) {
    await Board2.setUser(relatedUser2);
  }

  const relatedUser3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Board3 = await Boards.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Board3?.setUser) {
    await Board3.setUser(relatedUser3);
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Tasks.bulkCreate(TasksData);

    await Boards.bulkCreate(BoardsData);

    await Promise.all([await associateBoardWithUser()]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tasks', null, {});

    await queryInterface.bulkDelete('boards', null, {});
  },
};
