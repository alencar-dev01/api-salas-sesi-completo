const cron = require('node-cron');
const db = require('../models/index');
const { Op } = require('sequelize');

// Executa a tarefa de hora em hora
cron.schedule('0 * * * *', async () => {
  console.log('🔄 [CRON] Verificando e limpando reservas finalizadas há mais de 24 horas...');

  try {
    const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const reservasDeletadas = await db.Reserva.destroy({
      where: {
        dataFim: {
          [Op.lt]: vinteQuatroHorasAtras
        },

        status: { [Op.in]: ['Finalizada'] }

      }
    });

    if (reservasDeletadas > 0) {
      console.log(`🧹 [CRON] Sucesso! ${reservasDeletadas} reserva(s) antiga(s) foi(ram) apagada(s) do banco.`);
    } else {
      console.log('ℹ️ [CRON] Nenhuma reserva antiga encontrada para exclusão.');
    }

  } catch (error) {
    console.error('❌ [CRON] Erro ao tentar limpar reservas antigas:', error);
  }
});