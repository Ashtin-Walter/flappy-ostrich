export const GAME_CONFIG = {
  GRAVITY: 0.5,
  JUMP_FORCE: -10,
  OBSTACLE_SPEED: 3,
  OBSTACLE_GAP: 150,
  OBSTACLE_WIDTH: 60,
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
};

export const checkCollision = (
  ostrichPos: { x: number; y: number; width: number; height: number },
  obstacle: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    ostrichPos.x < obstacle.x + obstacle.width &&
    ostrichPos.x + ostrichPos.width > obstacle.x &&
    ostrichPos.y < obstacle.y + obstacle.height &&
    ostrichPos.y + ostrichPos.height > obstacle.y
  );
};

export const generateObstacle = () => {
  const minHeight = 50;
  const maxHeight = GAME_CONFIG.GAME_HEIGHT - GAME_CONFIG.OBSTACLE_GAP - minHeight;
  const height = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

  return {
    height,
    gap: GAME_CONFIG.OBSTACLE_GAP,
    x: GAME_CONFIG.GAME_WIDTH,
  };
};

export const calculateScore = (obstacles: { x: number }[], ostrichX: number): number => {
  return obstacles.filter((obstacle) => obstacle.x + GAME_CONFIG.OBSTACLE_WIDTH < ostrichX).length;
};