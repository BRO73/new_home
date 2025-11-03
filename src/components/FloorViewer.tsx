import { Card, CardContent } from '@/components/ui/card';
import { FloorElement, TableResponse } from '@/types/index.ts';
import {useTables} from "@/hooks/useTables.ts";

interface FloorViewerProps {
    floor: string;
    elements: FloorElement[];
    tables?: TableResponse[]; // để lấy capacity giống Konva
}

export const FloorViewer = ({ floor, elements, tables = [] }: FloorViewerProps) => {
    tables = useTables().tables;
    console.log(tables);
    const getTableCapacity = (elm: FloorElement) => {
        if (elm.tableId != null) {
            console.log(elm.tableId);
            const table = tables.find(t => t.id === elm.tableId);
            if (table) return table.capacity;
        }
        return 0;
    }

    // helper shadeColor cho gradient
    const shadeColor = (color: string, percent: number) => {
        const f = parseInt(color.slice(1), 16),
            t = percent < 0 ? 0 : 255,
            p = Math.abs(percent) / 100,
            R = f >> 16,
            G = (f >> 8) & 0x00FF,
            B = f & 0x0000FF;
        const newR = Math.round((t - R) * p + R);
        const newG = Math.round((t - G) * p + G);
        const newB = Math.round((t - B) * p + B);
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    return (
        <Card className="h-full min-h-[400px]">
            <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">{floor}</h3>
                <div className="w-full h-[350px] bg-gray-100 rounded-lg relative overflow-hidden border-2 border-gray-200">
                    <svg width="100%" height="100%" viewBox="0 0 800 600" className="bg-white">
                        {elements.map((element) => {
                            const { x, y, width, height, color, label, type } = element;

                            // Gradient fill cho bàn / balcony / other
                            const gradientFill = (color?: string) =>
                                color
                                    ? `url(#grad-${element.id})`
                                    : '#999';

                            return (
                                <g key={element.id}>
                                    {/* Define gradient if needed */}
                                    {(type === 'table' || type === 'balcony' || type === 'other') && (
                                        <defs>
                                            <linearGradient id={`grad-${element.id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={shadeColor(color || '#ccc', 20)} />
                                                <stop offset="100%" stopColor={shadeColor(color || '#ccc', -10)} />
                                            </linearGradient>
                                        </defs>
                                    )}

                                    {/* Render shapes */}
                                    {type === 'table' && (
                                        <>
                                            <rect
                                                x={x - width / 2}
                                                y={y - height / 2}
                                                width={width}
                                                height={height}
                                                fill={gradientFill(color)}
                                                stroke="#333"
                                                strokeWidth={2}
                                                rx={6}
                                                opacity={0.9}
                                            />
                                            {/* Shadow */}
                                            <rect
                                                x={x - width / 2}
                                                y={y - height / 2 + 2}
                                                width={width}
                                                height={height}
                                                fill="#00000022"
                                                rx={6}
                                            />
                                            {/* Capacity */}
                                            <text
                                                x={x}
                                                y={y}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize="16"
                                                fontWeight="bold"
                                                fill="white"
                                                stroke="#000"
                                                strokeWidth={0.5}
                                            >
                                                {`${getTableCapacity(element)}P`}
                                            </text>
                                        </>
                                    )}

                                    {type === 'window' && (
                                        <>
                                            <rect
                                                x={x - width / 2}
                                                y={y - height / 2}
                                                width={width}
                                                height={height}
                                                fill="#CFE8FF"
                                                stroke="#0369A1"
                                                strokeWidth={2}
                                                rx={4}
                                            />
                                            <line x1={x - width / 2} y1={y} x2={x + width / 2} y2={y} stroke="#0369A1" strokeWidth={2} />
                                            <line x1={x} y1={y - height / 2} x2={x} y2={y + height / 2} stroke="#0369A1" strokeWidth={2} />
                                        </>
                                    )}

                                    {type === 'door' && (
                                        <>
                                            <rect
                                                x={x - width / 2}
                                                y={y - height / 2}
                                                width={width}
                                                height={height}
                                                fill="#FFD27F"
                                                stroke="#92400E"
                                                strokeWidth={2}
                                                rx={4}
                                            />
                                            <rect
                                                x={x - (width * 0.7) / 2}
                                                y={y - height / 2}
                                                width={width * 0.7}
                                                height={height * 0.15}
                                                fill="#D97706"
                                                rx={2}
                                            />
                                        </>
                                    )}

                                    {type === 'balcony' && (
                                        <>
                                            <rect
                                                x={x - width / 2}
                                                y={y - height / 2}
                                                width={width}
                                                height={height}
                                                fill={gradientFill(color)}
                                                stroke="#333"
                                                strokeWidth={2}
                                                rx={4}
                                                opacity={0.9}
                                            />
                                            <line
                                                x1={x - width / 2 + 10}
                                                y1={y - height / 2 + 10}
                                                x2={x + width / 2 - 10}
                                                y2={y - height / 2 + 10}
                                                stroke="#fff"
                                                strokeWidth={2}
                                                opacity={0.6}
                                            />
                                            <line
                                                x1={x - width / 2 + 10}
                                                y1={y + height / 2 - 10}
                                                x2={x + width / 2 - 10}
                                                y2={y + height / 2 - 10}
                                                stroke="#fff"
                                                strokeWidth={2}
                                                opacity={0.6}
                                            />
                                        </>
                                    )}

                                    {type === 'other' && (
                                        <rect
                                            x={x - width / 2}
                                            y={y - height / 2}
                                            width={width}
                                            height={height}
                                            fill={gradientFill(color)}
                                            stroke="#333"
                                            strokeWidth={2}
                                            rx={4}
                                            opacity={0.9}
                                        />
                                    )}

                                    {/* Label */}
                                    {label && (
                                        <text
                                            x={x}
                                            y={y - height / 2 - 10}
                                            textAnchor="middle"
                                            fontSize="12"
                                            fontWeight="600"
                                            fill="#1F2937"
                                        >
                                            {label}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
};
