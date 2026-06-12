const { Sequelize } = require('sequelize');

// Se existir a variável DATABASE_URL (na nuvem), usa o Postgres. 
// Se não existir (no seu PC local), continua a usar o SQLite para não estragar os seus testes locais.
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Obrigatório para o Neon funcionar corretamente no Render
        }
      },
      logging: false
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database/database.sqlite',
      logging: false
    });

module.exports = sequelize;