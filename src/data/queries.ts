import sql from 'mssql';
import { query } from './sqlClient';
import { log } from '../utils/logger';

export enum Roles {
  CLIENTE = 'CLIENTE'
}

export enum Garantias {
  SI = 1,
  NO = 0
}

export enum Tributacion {
  EXENTO = 969790000,
  NO_EXENTO = 969790001
}

export enum Modulos {
  IMPORTACION = 'Importacion',
  EXPORTACION = 'Exportacion'
}

export enum EstadoOperativo {
  MANIFESTADO = 'Manifestado',
  RETORNADO = 'Retornado',
  EN_PUERTO = 'En puerto',
  EN_CALLE = 'En calle',
  RETORNADO_EN_PUERTO = 'Retornado En puerto'
}

export const QUERY_CLIENTE_AUTORIZACION = `
SELECT TOP 1 
  ud.tkl_name,
  CASE c.tkl_tributacion 
    WHEN 969790000 THEN 'Exento'
    WHEN 969790001 THEN 'No Exento'
  END as tributacion
FROM tkl_usuariosclientesdetalle ud
INNER JOIN tkl_clientes c ON c.tkl_clientesId = ud.tkl_clientes
WHERE ud.tkl_usuariodphvirtualName = @usuario 
  AND ud.tkl_roldphvirtualName = @rol 
  AND c.tkl_garantia = @garantia 
  AND c.tkl_tributacion = @tributacion
`;

export async function obtenerClienteAutorizacion(params?: {
  usuario?: string;
  rol?: string;
  garantia?: string | number | boolean;
  tributacion?: number;
}) {
  const usuario = params?.usuario ?? process.env.SQL_USUARIO_APP ?? 'usuario-demo';
  const rol = params?.rol ?? process.env.SQL_ROL_APP ?? 'ROL-DEMO';
  const garantiaEnv = String(params?.garantia ?? process.env.SQL_GARANTIA_APP ?? '1');
  const garantiaIsBit = ['0', '1', 'true', 'false'].includes(garantiaEnv.toLowerCase());
  const garantiaValue = garantiaEnv.toLowerCase() === 'true' ? 1 : garantiaEnv.toLowerCase() === 'false' ? 0 : parseInt(garantiaEnv, 10) || garantiaEnv;
  const tributacion = params?.tributacion ?? (process.env.SQL_TRIBUTACION_APP ?? '969790000');

  const result = await query(QUERY_CLIENTE_AUTORIZACION, {
    usuario: { type: sql.VarChar, value: usuario },
    rol: { type: sql.VarChar, value: rol },
    garantia: garantiaIsBit ? { type: sql.Bit, value: Number(garantiaValue) } : { type: sql.VarChar, value: String(garantiaValue) },
    tributacion: { type: sql.VarChar, value: String(tributacion) },
  }, 30000);

  const row = result.recordset?.[0];
  if (!row) return null;
  return { nombre: row.tkl_name as string, tributacion: row.tributacion as string };
}

export const QUERY_CONTENEDOR_PENDIENTE = `
SELECT TOP 1 tkl_ContenedorName as contenedor
FROM tkl_demoracontenedor
WHERE tkl_ClienteName = @cliente
  AND tkl_moduloname = @modulo
  AND tkl_BalanceTotaldeDemora > 1
  AND tkl_estadooperativo IS NOT NULL
ORDER BY tkl_ContenedorName DESC
`;

export async function obtenerContenedorPendiente(params: { cliente: string; modulo?: string }) {
  const modulo = params.modulo ?? process.env.SQL_MODULO_APP ?? 'Autorizacion de Salida';
  const result = await query(QUERY_CONTENEDOR_PENDIENTE, {
    cliente: { type: sql.VarChar, value: params.cliente },
    modulo: { type: sql.VarChar, value: modulo },
  }, 30000);
  const row = result.recordset?.[0];
  return row?.contenedor as string | undefined;
}

export const QUERY_CONTENEDOR_CLIENTE = `
SELECT TOP 1 dm.tkl_ContenedorName AS contenedor, dm.tkl_ClienteName AS cliente
FROM tkl_demoracontenedor dm
INNER JOIN tkl_solicituddetalledemora sd ON dm.tkl_demoracontenedorId = sd.tkl_demoracontenedor
WHERE (@cliente IS NULL OR dm.tkl_ClienteName = @cliente)
  AND dm.tkl_moduloname = @modulo
  AND dm.tkl_BalanceTotaldeDemora > 1
  AND dm.tkl_estadooperativo IS NOT NULL
  AND sd.tkl_demoracontenedor IS NULL
ORDER BY dm.tkl_ContenedorName DESC
`;

export async function obtenerContenedorYCliente(params?: { cliente?: string; modulo?: string }) {
  const modulo = params?.modulo ?? process.env.SQL_MODULO_APP ?? 'Autorizacion de Salida';
  const cliente = params?.cliente ?? null;
  const result = await query(QUERY_CONTENEDOR_CLIENTE, {
    cliente: cliente === null ? { type: sql.NVarChar, value: null } : { type: sql.VarChar, value: cliente },
    modulo: { type: sql.VarChar, value: modulo },
  }, 30000);
  const row = result.recordset?.[0];
  if (!row) return null;
  return { contenedor: row.contenedor as string, cliente: row.cliente as string };
}

export const QUERY_UNIFICADO_CLIENTE_CONTENEDOR = `
SELECT TOP 1
  ud.tkl_name AS usuarioCliente,
  c.tkl_name AS cliente,
  CASE c.tkl_tributacion
    WHEN 969790000 THEN 'Exento'
    WHEN 969790001 THEN 'No Exento'
  END AS tributacion,
  dc.contenedor
FROM tkl_usuariosclientesdetalle ud
INNER JOIN tkl_clientes c ON c.tkl_clientesId = ud.tkl_clientes
CROSS APPLY (
  SELECT TOP 1 dm.tkl_ContenedorName AS contenedor
  FROM tkl_demoracontenedor dm
  WHERE dm.tkl_ClienteName = c.tkl_name
    AND dm.tkl_moduloname = @modulo
    AND dm.tkl_BalanceTotaldeDemora > 1
    AND dm.tkl_estadooperativoName = @estadoOperativo
    AND dm.tkl_estadooperativo IS NOT NULL
    AND dm.tkl_ContenedorName IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM tkl_solicituddetalledemora sd_check
        WHERE sd_check.tkl_demoracontenedor = dm.tkl_demoracontenedorId
    )
  ORDER BY dm.tkl_ContenedorName DESC
) dc
WHERE ud.tkl_usuariodphvirtualName = @usuario 
  AND ud.tkl_roldphvirtualName = @rol 
  AND c.tkl_garantia = @garantia
  AND  c.tkl_tributacion = @tributacion`;

export async function obtenerClienteYContenedorUnificado(params?: {
  usuario?: string;
  rol?: string;
  garantia?: string | number | boolean;
  tributacion?: number;
  modulo?: string;
  estadoOperativo?: string;
  cliente?: string;
}) {
  const usuario = params?.usuario ?? process.env.SQL_USUARIO_APP ?? 'usuario-demo';
  const rol = params?.rol ?? process.env.SQL_ROL_APP ?? 'ROL-DEMO';
  const garantiaEnvRaw = params?.garantia ?? process.env.SQL_GARANTIA_APP;
  const garantiaEnv = garantiaEnvRaw === undefined ? '' : String(garantiaEnvRaw);
  const garantiaIsBit = ['0', '1', 'true', 'false'].includes(garantiaEnv.toLowerCase());
  const garantiaValue = garantiaEnv.toLowerCase() === 'true' ? 1 : garantiaEnv.toLowerCase() === 'false' ? 0 : (garantiaEnv.trim() === '' ? null : (isNaN(parseInt(garantiaEnv, 10)) ? garantiaEnv : parseInt(garantiaEnv, 10)));
  const tributacionRaw = params?.tributacion ?? process.env.SQL_TRIBUTACION_APP;
  const tributacion = tributacionRaw === undefined ? null : String(tributacionRaw).trim() === '' ? null : String(tributacionRaw);
  const modulo = params?.modulo ?? process.env.SQL_MODULO_APP ?? 'Autorizacion de Salida';
  const cliente = params?.cliente ?? null;
  const estadoOperativo = params?.estadoOperativo ?? process.env.SQL_ESTADO_OPERATIVO_APP ?? EstadoOperativo.MANIFESTADO;

  const result = await query(QUERY_UNIFICADO_CLIENTE_CONTENEDOR, {
    usuario: { type: sql.VarChar, value: usuario },
    rol: { type: sql.VarChar, value: rol },
    garantia: garantiaValue === null ? { type: sql.Bit, value: null } : (garantiaIsBit ? { type: sql.Bit, value: Number(garantiaValue) } : { type: sql.VarChar, value: String(garantiaValue) }),
    tributacion: tributacion === null ? { type: sql.NVarChar, value: null } : { type: sql.VarChar, value: String(tributacion) },
    modulo: { type: sql.VarChar, value: modulo },
    estadoOperativo: { type: sql.VarChar, value: estadoOperativo },
    cliente: cliente === null ? { type: sql.NVarChar, value: null } : { type: sql.VarChar, value: cliente },
  }, 30000);

  const row = result.recordset?.[0];
  log(`unificado_params usuario=${usuario} rol=${rol} garantia=${garantiaEnv} tributacion=${tributacion ?? ''} modulo=${modulo} estadoOperativo=${estadoOperativo} cliente=${cliente ?? ''}`);
  if (!row) {
    log('unificado_result empty');
    return null;
  }
  log(`unificado_result cliente=${row.cliente} contenedor=${row.contenedor}`);
  if (!row) return null;
  return {
    usuarioCliente: row.usuarioCliente as string,
    cliente: row.cliente as string,
    tributacion: row.tributacion as string,
    contenedor: row.contenedor as string,
  };
}
