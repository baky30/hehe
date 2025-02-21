
const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class TasksDBApi {

    static async create(data, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        const tasks = await db.tasks.create(
            {
                id: data.id || undefined,

        title: data.title
        ||
        null
            ,

        description: data.description
        ||
        null
            ,

        status: data.status
        ||
        null
            ,

        start_date: data.start_date
        ||
        null
            ,

        end_date: data.end_date
        ||
        null
            ,

        likes_count: data.likes_count
        ||
        null
            ,

            importHash: data.importHash || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
    },
        { transaction },
    );

        return tasks;
    }

    static async bulkImport(data, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        // Prepare data - wrapping individual data transformations in a map() method
        const tasksData = data.map((item, index) => ({
                id: item.id || undefined,

                title: item.title
            ||
            null
            ,

                description: item.description
            ||
            null
            ,

                status: item.status
            ||
            null
            ,

                start_date: item.start_date
            ||
            null
            ,

                end_date: item.end_date
            ||
            null
            ,

                likes_count: item.likes_count
            ||
            null
            ,

            importHash: item.importHash || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
            createdAt: new Date(Date.now() + index * 1000),
    }));

        // Bulk create items
        const tasks = await db.tasks.bulkCreate(tasksData, { transaction });

        // For each item created, replace relation files

        return tasks;
    }

    static async update(id, data,  options) {
        const currentUser = (options && options.currentUser) || {id: null};
        const transaction = (options && options.transaction) || undefined;

        const tasks = await db.tasks.findByPk(id, {}, {transaction});

        await tasks.update(
            {

        title: data.title
        ||
        null
            ,

        description: data.description
        ||
        null
            ,

        status: data.status
        ||
        null
            ,

        start_date: data.start_date
        ||
        null
            ,

        end_date: data.end_date
        ||
        null
            ,

        likes_count: data.likes_count
        ||
        null
            ,

            updatedById: currentUser.id,
    },
        {transaction},
    );

        return tasks;
    }

    static async deleteByIds(ids, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        const tasks = await db.tasks.findAll({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
            transaction,
        });

        await db.sequelize.transaction(async (transaction) => {
            for (const record of tasks) {
                await record.update(
                    {deletedBy: currentUser.id},
                    {transaction}
                );
            }
            for (const record of tasks) {
                await record.destroy({transaction});
            }
        });

        return tasks;
    }

    static async remove(id, options) {
        const currentUser = (options && options.currentUser) || {id: null};
        const transaction = (options && options.transaction) || undefined;

        const tasks = await db.tasks.findByPk(id, options);

        await tasks.update({
            deletedBy: currentUser.id
        }, {
            transaction,
        });

        await tasks.destroy({
            transaction
        });

        return tasks;
    }

    static async findBy(where, options) {
        const transaction = (options && options.transaction) || undefined;

        const tasks = await db.tasks.findOne(
            { where },
            { transaction },
        );

        if (!tasks) {
            return tasks;
        }

        const output = tasks.get({plain: true});

        return output;
    }

    static async findAll(
          filter,
           options
        ) {
        const limit = filter.limit || 0;
        let offset = 0;
        let where = {};
        const currentPage = +filter.page;

        offset = currentPage * limit;

        const orderBy = null;

    const transaction = (options && options.transaction) || undefined;

    let include = [

    ];

        if (filter) {
            if (filter.id) {
                where = {
                    ...where,
                    ['id']: Utils.uuid(filter.id),
                };
            }

            if (filter.title) {
                where = {
                    ...where,
                    [Op.and]: Utils.ilike(
                        'tasks',
                        'title',
                        filter.title,
                    ),
                };
            }

            if (filter.description) {
                where = {
                    ...where,
                    [Op.and]: Utils.ilike(
                        'tasks',
                        'description',
                        filter.description,
                    ),
                };
            }

            if (filter.start_dateRange) {
                const [start, end] = filter.start_dateRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                    start_date: {
                    ...where.start_date,
                            [Op.gte]: start,
                    },
                };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                    start_date: {
                    ...where.start_date,
                            [Op.lte]: end,
                    },
                };
                }
            }

            if (filter.end_dateRange) {
                const [start, end] = filter.end_dateRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                    end_date: {
                    ...where.end_date,
                            [Op.gte]: start,
                    },
                };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                    end_date: {
                    ...where.end_date,
                            [Op.lte]: end,
                    },
                };
                }
            }

            if (filter.likes_countRange) {
                const [start, end] = filter.likes_countRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                    likes_count: {
                    ...where.likes_count,
                            [Op.gte]: start,
                    },
                };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                    likes_count: {
                    ...where.likes_count,
                            [Op.lte]: end,
                    },
                };
                }
            }

            if (filter.active !== undefined) {
                where = {
                    ...where,
                    active: filter.active === true || filter.active === 'true'
                };
            }

            if (filter.status) {
                where = {
                    ...where,
                status: filter.status,
            };
            }

            if (filter.createdAtRange) {
                const [start, end] = filter.createdAtRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                        ['createdAt']: {
                            ...where.createdAt,
                            [Op.gte]: start,
                        },
                    };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                        ['createdAt']: {
                            ...where.createdAt,
                            [Op.lte]: end,
                        },
                    };
                }
            }
        }

        const queryOptions = {
            where,
            include,
            distinct: true,
            order: filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction: options?.transaction,
            logging: console.log
        };

        if (!options?.countOnly) {
            queryOptions.limit = limit ? Number(limit) : undefined;
            queryOptions.offset = offset ? Number(offset) : undefined;
        }

        try {
            const { rows, count } = await db.tasks.findAndCountAll(queryOptions);

            return {
                rows: options?.countOnly ? [] : rows,
                count: count
            };
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    static async findAllAutocomplete(query, limit, offset, ) {
        let where = {};

        if (query) {
            where = {
                [Op.or]: [
                    { ['id']: Utils.uuid(query) },
                    Utils.ilike(
                        'tasks',
                        '',
                        query,
                    ),
                ],
            };
        }

        const records = await db.tasks.findAll({
            attributes: [ 'id', '' ],
            where,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            orderBy: [['', 'ASC']],
        });

        return records.map((record) => ({
            id: record.id,
            label: record.,
        }));
    }

};

