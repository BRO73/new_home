import { Card, CardContent } from '@/components/ui/card';
import { FloorElement, TableResponse } from '@/types/index.ts';
import {useEffect, useState} from 'react';

interface FloorViewerProps {
    onSelectTables?: (tables: TableResponse[]) => void; // callback multi-select
    floor: string;
    elements: FloorElement[];
    tables: TableResponse[];
}


export const FloorViewer = ({
                                onSelectTables,
                                floor,
                                elements = [],
                                tables = []
                            }: FloorViewerProps) => {
    const [selectedTables, setSelectedTables] = useState<TableResponse[]>([]);

    useEffect(() => {
        onSelectTables?.(selectedTables);
    }, [selectedTables]);


    const handleClickTable = (table: TableResponse | null) => {
        if (!table) return;

        setSelectedTables(prev => {
            const exists = prev.find(t => t.id === table.id);
            let newSelection;
            if (exists) {
                newSelection = prev.filter(t => t.id !== table.id);
            } else {
                newSelection = [...prev, table];
            }
            onSelectTables?.(newSelection); // call callback **ngay trong handleClick**
            return newSelection;
        });
    };


    const handleClickBackground = () => {
        setSelectedTables([]);
    };



    const getTableByElement = (elm: FloorElement): TableResponse | null => {
        return tables.find(tbl => elm.tableId === tbl.id) || null;
    };

    const getTableCapacity = (elm: FloorElement) => {
        if (elm.tableId != null) {
            const table = tables.find(t => t.id === elm.tableId);
            if (table) return table.capacity;
        }
        return 0;
    };

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
    };

    const maxX = Math.max(...elements.map(el => el.x + el.width / 2), 800);
    const maxY = Math.max(...elements.map(el => el.y + el.height / 2), 600);

    const renderOtherTypes = (element: FloorElement) => {
        const { x, y, width, height, color, type } = element;
        const table = getTableByElement(element);
        const isSelected = table ? selectedTables.some(t => t.id === table.id) : false;

        // kiểm tra trạng thái
        const isDisabled = table && table.status.toString().toLowerCase() !== 'available';
        const fillColor = isDisabled ? '#ccc' : (color ? `url(#grad-${element.id})` : '#999');
        const strokeColor = isDisabled ? '#888' : isSelected ? '#fff' : '#333';
        const strokeWidth = isSelected ? 4 : 2;
        const cursorStyle = isDisabled ? 'not-allowed' : 'pointer';

        switch (type) {
            case 'table':
                return (
                    <>
                        <rect
                            x={x - width / 2}
                            y={y - height / 2 + 2}
                            width={width}
                            height={height}
                            fill="#00000022"
                            rx={6}
                            pointerEvents="none"
                        />
                        <rect
                            x={x - width / 2}
                            y={y - height / 2}
                            width={width}
                            height={height}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            rx={6}
                            opacity={0.9}
                            style={{ cursor: cursorStyle }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isDisabled && table) handleClickTable(table);
                            }}
                        />
                        <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="16"
                            fontWeight="bold"
                            fill={isDisabled ? '#555' : 'white'}
                            stroke="#000"
                            strokeWidth={0.5}
                            pointerEvents="none"
                        >
                            {`${getTableCapacity(element)}P`}
                        </text>
                    </>
                );
            case 'window':
                return (
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
                        <line
                            x1={x - width / 2}
                            y1={y}
                            x2={x + width / 2}
                            y2={y}
                            stroke="#0369A1"
                            strokeWidth={2}
                        />
                        <line
                            x1={x}
                            y1={y - height / 2}
                            x2={x}
                            y2={y + height / 2}
                            stroke="#0369A1"
                            strokeWidth={2}
                        />
                    </>
                );
            case 'door':
                return (
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
                );
            default:
                return null;
        }
    };

    return (
        <Card className="h-full min-h-[400px]">
            <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">{floor}</h3>
                <div
                    className="w-full h-[350px] bg-gray-100 rounded-lg relative overflow-hidden border-2 border-gray-200"
                    onClick={handleClickBackground} // click background -> hủy chọn
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${maxX + 50} ${maxY + 50}`}
                        className="bg-white"
                    >
                        {[
                            ...elements.filter(el => el.type === "other"),
                            ...elements.filter(el => el.type === "balcony"),
                            ...elements.filter(el => !["other", "balcony"].includes(el.type))
                        ].map((element) => {
                            const { x, y, width, height, color, label, type } = element;

                            if (type === 'table' || type === 'balcony' || type === 'other') {
                                const gradId = `grad-${element.id}`;
                                const gradientFill = color ? `url(#${gradId})` : '#999';
                                return (
                                    <g key={element.id}>
                                        <defs>
                                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={shadeColor(color || '#ccc', 20)} />
                                                <stop offset="100%" stopColor={shadeColor(color || '#ccc', -10)} />
                                            </linearGradient>
                                        </defs>

                                        {type === 'other' && (
                                            <rect
                                                x={x - width / 2}
                                                y={y - height / 2}
                                                width={width}
                                                height={height}
                                                fill={gradientFill}
                                                stroke="#333"
                                                strokeWidth={2}
                                                rx={4}
                                            />
                                        )}

                                        {type === 'balcony' && (
                                            <>
                                                <rect
                                                    x={x - width / 2}
                                                    y={y - height / 2}
                                                    width={width}
                                                    height={height}
                                                    fill={gradientFill}
                                                    stroke="#333"
                                                    strokeWidth={2}
                                                    rx={4}
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

                                        {type !== "other" && type !== "balcony" && renderOtherTypes(element)}

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
                            } else {
                                return <g key={element.id}>{renderOtherTypes(element)}</g>;
                            }
                        })}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
};
