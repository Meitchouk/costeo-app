// app/api/costeo/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { ventas, costosVariables, costosFijos, metodo } = await request.json();

        // Convertir a número por seguridad
        const v = parseFloat(ventas);
        const cv = parseFloat(costosVariables);
        const cf = parseFloat(costosFijos);

        if ([v, cv, cf].some((val) => isNaN(val))) {
            return NextResponse.json(
                { error: 'Los valores de ventas, costos variables o costos fijos no son válidos.' },
                { status: 400 }
            );
        }

        let resultado = 0;
        if (metodo === 'directo') {
            // Costeo Directo: utilidad = (ventas - costos variables) - costos fijos
            resultado = (v - cv) - cf;
        } else if (metodo === 'absorcion') {
            // Costeo por Absorción: utilidad = ventas - (costos variables + costos fijos)
            resultado = v - (cv + cf);
        } else {
            return NextResponse.json({ error: 'Método de costeo no válido.' }, { status: 400 });
        }

        return NextResponse.json({ resultado });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Ocurrió un error en el cálculo.' }, { status: 500 });
    }
}
