import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSQLite } from '../../context/SQLiteContext';
import { TableInfo } from '../../types';
import { theme } from '../../styles/theme';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  background: linear-gradient(90deg, #f5f5f5 0px, transparent 1px),
    linear-gradient(#f5f5f5 0px, transparent 1px);
  background-size: 20px 20px;
`;

const SVG = styled.svg`
  width: 100%;
  height: 100%;
  min-width: 1000px;
  min-height: 600px;
`;

const TableBox = styled.g<{ selected: boolean }>`
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const TableRect = styled.rect<{ selected: boolean }>`
  fill: ${(props) => (props.selected ? theme.colors.primary : theme.colors.white)};
  stroke: ${(props) => (props.selected ? theme.colors.primary : theme.colors.border)};
  stroke-width: ${(props) => (props.selected ? 2 : 1)};
  rx: ${theme.borderRadius.sm};
  filter: ${(props) => (props.selected ? theme.shadows.lg : theme.shadows.sm)};
`;

const TableTitle = styled.text`
  font-weight: bold;
  font-size: 14px;
  fill: ${theme.colors.text};
  pointer-events: none;
`;

const ColumnText = styled.text`
  font-size: 12px;
  fill: ${theme.colors.text};
  pointer-events: none;
`;

const ForeignKeyLine = styled.line`
  stroke: ${theme.colors.secondary};
  stroke-width: 2;
  marker-end: url(#arrowhead);
  opacity: 0.6;
`;

const Controls = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  display: flex;
  gap: ${theme.spacing.sm};
  z-index: 10;
`;

const Button = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.light};
    border-color: ${theme.colors.primary};
  }
`;

interface SQLiteViewerProps {
  width?: number;
  height?: number;
  onTableSelect?: (tableName: string) => void;
}

/**
 * SQLiteViewer - ER diagram component for visualizing database schema
 */
export const SQLiteViewer: React.FC<SQLiteViewerProps> = ({
  width = 800,
  height = 600,
  onTableSelect,
}) => {
  const { getSchema } = useSQLite();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const schema = getSchema();
  const tables = schema.tables;

  // Calculate optimal layout for tables
  const layout = useMemo(() => {
    if (tables.length === 0) {
      return { tables: [], relationships: [] };
    }

    const tableWidth = 200;
    const tableHeight = 40; // Header
    const columnHeight = 20;
    const margin = 50;
    const cols = Math.ceil(Math.sqrt(tables.length));
    const rows = Math.ceil(tables.length / cols);

    const tablePositions = tables.map((table, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = margin + col * (tableWidth + margin);
      const y = margin + row * (tableHeight + table.columns.length * columnHeight + margin * 2);

      const height = tableHeight + table.columns.length * columnHeight + 10;

      return {
        table,
        x,
        y,
        width: tableWidth,
        height,
      };
    });

    // Calculate relationships (foreign keys)
    const relationships = tables.flatMap((table) =>
      table.foreignKeys.map((fk) => {
        const fromTable = tablePositions.find((tp) => tp.table.name === fk.from);
        const toTable = tablePositions.find((tp) => tp.table.name === fk.to);

        if (!fromTable || !toTable) {
          return null;
        }

        // Find column positions
        const fromColumnIndex = fromTable.table.columns.findIndex((col) => col.name === fk.fromColumn);
        const toColumnIndex = toTable.table.columns.findIndex((col) => col.name === fk.toColumn);

        const fromY = fromTable.y + 40 + fromColumnIndex * 20 + 10;
        const toY = toTable.y + 40 + toColumnIndex * 20 + 10;

        return {
          from: { x: fromTable.x + fromTable.width, y: fromY },
          to: { x: toTable.x, y: toY },
          fromTable: fk.from,
          toTable: fk.to,
        };
      })
    ).filter((rel): rel is NonNullable<typeof rel> => rel !== null);

    return { tables: tablePositions, relationships };
  }, [tables]);

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName === selectedTable ? null : tableName);
    onTableSelect?.(tableName);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (tables.length === 0) {
    return (
      <Container style={{ width, height }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.colors.textLight,
          }}
        >
          No tables in database. Load or create a database to see the ER diagram.
        </div>
      </Container>
    );
  }

  const svgWidth = Math.max(
    ...layout.tables.map((t) => t.x + t.width),
    1000
  );
  const svgHeight = Math.max(
    ...layout.tables.map((t) => t.y + t.height),
    600
  );

  return (
    <Container style={{ width, height }}>
      <Controls>
        <Button onClick={handleZoomIn}>Zoom In</Button>
        <Button onClick={handleZoomOut}>Zoom Out</Button>
        <Button onClick={handleReset}>Reset</Button>
      </Controls>
      <CanvasContainer>
        <SVG
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill={theme.colors.secondary} />
            </marker>
          </defs>

          {/* Draw relationships first (behind tables) */}
          {layout.relationships.map((rel, index) => (
            <ForeignKeyLine
              key={index}
              x1={rel.from.x}
              y1={rel.from.y}
              x2={rel.to.x}
              y2={rel.to.y}
            />
          ))}

          {/* Draw tables */}
          {layout.tables.map(({ table, x, y, width: w, height: h }) => {
            const isSelected = selectedTable === table.name;
            const columnHeight = 20;
            const headerHeight = 40;

            return (
              <TableBox
                key={table.name}
                selected={isSelected}
                onClick={() => handleTableClick(table.name)}
              >
                {/* Table rectangle */}
                <TableRect selected={isSelected} x={x} y={y} width={w} height={h} />

                {/* Table name */}
                <TableTitle x={x + 10} y={y + 25}>
                  {table.name}
                </TableTitle>

                {/* Columns */}
                {table.columns.map((column, colIndex) => {
                  const colY = y + headerHeight + colIndex * columnHeight;
                  const isPrimaryKey = column.pk;
                  const prefix = isPrimaryKey ? '🔑 ' : column.notnull ? '• ' : '○ ';

                  return (
                    <g key={column.name}>
                      <line
                        x1={x}
                        y1={colY}
                        x2={x + w}
                        y2={colY}
                        stroke={theme.colors.border}
                        strokeWidth={1}
                      />
                      <ColumnText x={x + 10} y={colY + 15}>
                        {prefix}
                        {column.name} ({column.type})
                      </ColumnText>
                    </g>
                  );
                })}
              </TableBox>
            );
          })}
        </SVG>
      </CanvasContainer>
    </Container>
  );
};

