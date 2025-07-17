// src/layoutEngine.ts
import type { UUID } from './types/common';
import type { AnyShape, FrameShape } from './types/shape';
import type { Matrix } from './types/geometry';
import type { ComputedLayout } from './types/layoutEngine';
import type {
  FlexDirection,
  JustifyContent,
  AlignItems,
  GridDirection,
  GridTrack,
} from './types/layout';

/**
 * Helper to create a basic transform matrix including translation.
 * This is similar to the one in test.ts, but internal to layoutEngine.
 */
const createTranslationMatrix = (x: number, y: number): Matrix => {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y };
};

/**
 * The LayoutEngine is responsible for calculating the final positions and sizes
 * of shapes within layout containers (like Frames with Flex or Grid properties).
 */
export class LayoutEngine {
  /**
   * Calculates the layout for children within a given container.
   * This implementation focuses on basic Flexbox and Grid logic.
   *
   * @param container The FrameShape acting as a layout container.
   * @param allShapes A flat map of all shapes on the page, for resolving child references.
   * @returns A map of child UUIDs to their computed transformation matrices.
   */
  public calculateLayout(
    container: FrameShape,
    allShapes: Record<UUID, AnyShape>
  ): ComputedLayout {
    const computed: ComputedLayout = {};

    if (!container.layout) {
      console.log(
        `  LayoutEngine: No layout property for "${container.name}", skipping calculation.`
      );
      return computed;
    }

    console.log(
      `  LayoutEngine: Calculating ${container.layout} layout for "${container.name}"`
    );

    const rowGap = container.layout_gap?.row_gap ?? 0;
    const columnGap = container.layout_gap?.column_gap ?? 0;

    const paddingTop = container.layout_padding?.p1 ?? 0;
    const paddingRight = container.layout_padding?.p2 ?? 0;
    const paddingBottom = container.layout_padding?.p3 ?? 0;
    const paddingLeft = container.layout_padding?.p4 ?? 0;

    // Calculate the inner content area of the container
    const contentWidth = container.width - paddingLeft - paddingRight;
    const contentHeight = container.height - paddingTop - paddingBottom;

    // Filter out hidden shapes and collect actual child shape objects
    const children = container.shapes
      .map((id) => allShapes[id])
      .filter((child) => child && !child.hidden && !child.layout_item_absolute); // Ignore absolute for now

    if (children.length === 0) {
      return computed; // No children to lay out
    }

    if (container.layout === 'flex') {
      const flexDirection: FlexDirection = container.layout_flex_dir ?? 'row';
      const justifyContent: JustifyContent =
        container.layout_justify_content ?? 'start';
      const alignItems: AlignItems = container.layout_align_items ?? 'stretch';

      const isRowDirection =
        flexDirection === 'row' || flexDirection === 'row-reverse';
      const mainAxisLength = isRowDirection ? contentWidth : contentHeight;
      const crossAxisLength = isRowDirection ? contentHeight : contentWidth;
      const mainGap = isRowDirection ? columnGap : rowGap;

      const measuredChildren = children.map((child) => ({
        shape: child,
        intrinsicWidth: child.width,
        intrinsicHeight: child.height,
        computedX: 0,
        computedY: 0,
        computedWidth: child.width,
        computedHeight: child.height,
      }));

      let currentMainAxisPos = 0;
      let totalMainAxisContentSize = 0;

      measuredChildren.forEach((item, index) => {
        const childMainAxisSize = isRowDirection
          ? item.intrinsicWidth
          : item.intrinsicHeight;
        totalMainAxisContentSize += childMainAxisSize;
        if (index < measuredChildren.length - 1) {
          totalMainAxisContentSize += mainGap;
        }
      });

      let remainingSpace = mainAxisLength - totalMainAxisContentSize;
      let mainAxisOffset = 0;
      let spaceBetweenItems = 0;

      if (remainingSpace > 0) {
        switch (justifyContent) {
          case 'start':
            mainAxisOffset = 0;
            break;
          case 'center':
            mainAxisOffset = remainingSpace / 2;
            break;
          case 'end':
            mainAxisOffset = remainingSpace;
            break;
          case 'space-between':
            if (measuredChildren.length > 1) {
              spaceBetweenItems =
                remainingSpace / (measuredChildren.length - 1);
            }
            mainAxisOffset = 0;
            break;
        }
      }

      currentMainAxisPos = mainAxisOffset;
      measuredChildren.forEach((item) => {
        if (isRowDirection) {
          item.computedX = currentMainAxisPos;
        } else {
          item.computedY = currentMainAxisPos;
        }
        currentMainAxisPos +=
          (isRowDirection ? item.intrinsicWidth : item.intrinsicHeight) +
          mainGap +
          spaceBetweenItems;
      });

      measuredChildren.forEach((item) => {
        const childCrossAxisSize = isRowDirection
          ? item.intrinsicHeight
          : item.intrinsicWidth;
        let crossAxisPos = 0;

        switch (alignItems) {
          case 'start':
            crossAxisPos = 0;
            break;
          case 'center':
            crossAxisPos = (crossAxisLength - childCrossAxisSize) / 2;
            break;
          case 'end':
            crossAxisPos = crossAxisLength - childCrossAxisSize;
            break;
          case 'stretch':
            if (isRowDirection) {
              item.computedHeight = crossAxisLength;
            } else {
              item.computedWidth = crossAxisLength;
            }
            crossAxisPos = 0;
            break;
        }

        if (isRowDirection) {
          item.computedY = crossAxisPos;
        } else {
          item.computedX = crossAxisPos;
        }
      });

      measuredChildren.forEach((item) => {
        const finalX = item.computedX + paddingLeft;
        const finalY = item.computedY + paddingTop;
        computed[item.shape.id] = createTranslationMatrix(finalX, finalY);
      });
    } else if (container.layout === 'grid') {
      const gridDirection: GridDirection = container.layout_grid_dir ?? 'row';

      const columnTracks = container.layout_grid_columns ?? [];
      const rowTracks = container.layout_grid_rows ?? [];

      // --- Parse Track Definitions into Pixel Sizes ---
      const parseTracks = (
        tracks: GridTrack[],
        availableSize: number,
        gap: number
      ): number[] => {
        let fixedSizeSum = 0;
        let flexUnitCount = 0;
        const trackSizes: number[] = [];

        // First pass: calculate fixed and percent sizes, sum flex units
        tracks.forEach((track) => {
          if (
            track.type === 'fixed' &&
            track.value !== undefined &&
            track.value !== null
          ) {
            // <-- Added null check
            fixedSizeSum += track.value;
            trackSizes.push(track.value);
          } else if (
            track.type === 'percent' &&
            track.value !== undefined &&
            track.value !== null
          ) {
            // <-- Added null check
            const size = availableSize * (track.value / 100);
            fixedSizeSum += size;
            trackSizes.push(size);
          } else if (track.type === 'flex') {
            flexUnitCount += track.value ?? 1; // <-- CORRECTED: Use nullish coalescing for default 1
            trackSizes.push(0); // Placeholder for flex size
          } else if (track.type === 'auto') {
            flexUnitCount += 1; // Treat auto as 1fr for simplicity
            trackSizes.push(0); // Placeholder for auto size
          } else {
            trackSizes.push(0); // Fallback for invalid/unhandled track types
          }
        });

        const totalGapSize = (tracks.length > 0 ? tracks.length - 1 : 0) * gap;
        const remainingSpaceForFlex =
          availableSize - fixedSizeSum - totalGapSize;
        const flexUnitPx =
          flexUnitCount > 0 ? remainingSpaceForFlex / flexUnitCount : 0;

        // Second pass: assign flex/auto sizes
        return trackSizes.map((size, index) => {
          const track = tracks[index];
          if (track.type === 'flex' || track.type === 'auto') {
            // <-- CORRECTED: Use nullish coalescing for default 1
            return (track.value ?? 1) * flexUnitPx;
          }
          return size;
        });
      };

      const columnPxSizes = parseTracks(columnTracks, contentWidth, columnGap);
      const rowPxSizes = parseTracks(rowTracks, contentHeight, rowGap);

      // --- Calculate Grid Line Positions ---
      const getLinePositions = (pxSizes: number[], gap: number): number[] => {
        const positions: number[] = [0]; // Start at 0
        let currentPos = 0;
        pxSizes.forEach((size, index) => {
          currentPos += size;
          if (index < pxSizes.length - 1) {
            currentPos += gap;
          }
          positions.push(currentPos);
        });
        return positions;
      };

      const columnLinePositions = getLinePositions(columnPxSizes, columnGap);
      const rowLinePositions = getLinePositions(rowPxSizes, rowGap);

      // --- Auto-Place Children into Grid Cells ---
      let currentRow = 0;
      let currentColumn = 0;

      children.forEach((child) => {
        if (gridDirection === 'row') {
          if (currentColumn >= columnTracks.length) {
            currentColumn = 0;
            currentRow++;
          }
        } else {
          if (currentRow >= rowTracks.length) {
            currentRow = 0;
            currentColumn++;
          }
        }

        // Ensure we have a valid cell to place into within the *defined* grid
        // If we run out of defined tracks, we should stop placing in grid.
        if (
          currentRow < rowTracks.length &&
          currentColumn < columnTracks.length
        ) {
          const cellX = columnLinePositions[currentColumn];
          const cellY = rowLinePositions[currentRow];
          // For now, child fills the cell. No align-self/justify-self yet.
          // Add container's padding to the computed position
          const finalX = cellX + paddingLeft;
          const finalY = cellY + paddingTop;

          computed[child.id] = createTranslationMatrix(finalX, finalY);

          // Move to next cell for auto-placement
          if (gridDirection === 'row') {
            currentColumn++;
          } else {
            currentRow++;
          }
        } else {
          console.warn(
            `    LayoutEngine: Could not place child "${child.name}" in grid (out of defined tracks). Falling back to original transform.`
          );
          // Fallback: use original transform if cannot place in grid
          computed[child.id] = child.transform;
        }
      });
    }

    return computed;
  }
}
