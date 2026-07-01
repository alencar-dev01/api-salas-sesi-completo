import cron from 'node-cron';
import db from '../models/index.js';
import { Op } from 'sequelize';

// O código '0 * * * *' faz a tarefa rodar de hora em hora (no minuto 0 de cada hora)
cron.schedule('0 * * * *', async () => {
  console.log('🔄 [CRON] Verificando e limpando reservas finalizadas há mais de 24 horas...');

  try {
    // 1. Calcula o momento exato de 24 horas atrás
    const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 2. Executa a deleção no banco de dados
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