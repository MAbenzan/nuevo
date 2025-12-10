import { test, expect } from '@playwright/test';
import { query } from '../data/sqlClient';
import sql from 'mssql';
import { QUERY_CLIENTE_AUTORIZACION, obtenerClienteYContenedorUnificado, Restricciones, Accion_restriccion } from '../data/queries';

const hasEnv = !!process.env.SQL_SERVER && !!process.env.SQL_DATABASE && !!process.env.SQL_USER && !!process.env.SQL_PASSWORD;

test.describe('DB', () => {
  test.skip(!hasEnv, 'SQL env no configurado');

  test('Consulta cliente autorización bajo 5s', async () => {
    const start = Date.now();
    const garantiaEnv = process.env.SQL_GARANTIA_APP || '1';
    const garantiaIsBit = ['0','1','true','false'].includes(garantiaEnv.toLowerCase());
    const garantiaValue = garantiaEnv.toLowerCase() === 'true' ? 1 : garantiaEnv.toLowerCase() === 'false' ? 0 : parseInt(garantiaEnv, 10) || garantiaEnv;
    const res = await query(QUERY_CLIENTE_AUTORIZACION, {
      usuario: { type: sql.VarChar, value: process.env.SQL_USUARIO_APP || 'usuario-demo' },
      rol: { type: sql.VarChar, value: process.env.SQL_ROL_APP || 'ROL-DEMO' },
      garantia: garantiaIsBit ? { type: sql.Bit, value: Number(garantiaValue) } : { type: sql.VarChar, value: String(garantiaValue) },
      tributacion: { type: sql.Int, value: Number(process.env.SQL_TRIBUTACION_APP) || 969790000 },
    }, 30000);
    const dur = Date.now() - start;
    expect(dur).toBeLessThanOrEqual(5000);
    expect(res.recordset).toBeTruthy();
  });

  test('Soporta 10 consultas concurrentes', async () => {
    const garantiaEnv = process.env.SQL_GARANTIA_APP || '1';
    const garantiaIsBit = ['0','1','true','false'].includes(garantiaEnv.toLowerCase());
    const garantiaValue = garantiaEnv.toLowerCase() === 'true' ? 1 : garantiaEnv.toLowerCase() === 'false' ? 0 : parseInt(garantiaEnv, 10) || garantiaEnv;
    const tasks = Array.from({ length: 10 }).map(() => query(QUERY_CLIENTE_AUTORIZACION, {
      usuario: { type: sql.VarChar, value: process.env.SQL_USUARIO_APP || 'usuario-demo' },
      rol: { type: sql.VarChar, value: process.env.SQL_ROL_APP || 'ROL-DEMO' },
      garantia: garantiaIsBit ? { type: sql.Bit, value: Number(garantiaValue) } : { type: sql.VarChar, value: String(garantiaValue) },
      tributacion: { type: sql.Int, value: Number(process.env.SQL_TRIBUTACION_APP) || 969790000 },
    }, 30000));
    const start = Date.now();
    const results = await Promise.allSettled(tasks);
    const dur = Date.now() - start;
    const ok = results.filter(r => r.status === 'fulfilled').length;
    expect(ok).toBeGreaterThanOrEqual(10);
    expect(dur).toBeLessThanOrEqual(5000);
  });

  test('Consulta unificada cliente+contenedor', async ({}, testInfo) => {
    const info = await obtenerClienteYContenedorUnificado({
      usuario: process.env.SQL_USUARIO_APP,
      rol: process.env.SQL_ROL_APP,
      garantia: process.env.SQL_GARANTIA_APP,
      tributacion: Number(process.env.SQL_TRIBUTACION_APP),
      modulo: process.env.SQL_MODULO_APP,
      tipoRestriccion: process.env.SQL_TIPO_RESTRICCION || Restricciones.AUTORIZACION_SALIDA,
      accion: Number(process.env.SQL_ACCION_RESTRICCION) || Accion_restriccion.LIBERADO,
    });
    await testInfo.attach('unificado', { contentType: 'application/json', body: Buffer.from(JSON.stringify(info || {})) });
    if (!info) test.skip(true, 'No hay datos coincidentes para los filtros configurados');
    expect(info?.cliente).toBeTruthy();
    expect(info?.contenedor).toBeTruthy();
  });
});
