import sql from 'mssql';
import { query } from './sqlClient';

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
  const tributacion = params?.tributacion ?? (Number(process.env.SQL_TRIBUTACION_APP) || 969790000);

  const result = await query(QUERY_CLIENTE_AUTORIZACION, {
    usuario: { type: sql.VarChar, value: usuario },
    rol: { type: sql.VarChar, value: rol },
    garantia: garantiaIsBit ? { type: sql.Bit, value: Number(garantiaValue) } : { type: sql.VarChar, value: String(garantiaValue) },
    tributacion: { type: sql.Int, value: tributacion },
  }, 30000);

  const row = result.recordset?.[0];
  if (!row) return null;
  return { nombre: row.tkl_name as string, tributacion: row.tributacion as string };
}
