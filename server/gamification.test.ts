import { describe, expect, it } from "vitest";
import { levelForXp, rankForLevel, xpForNextLevel } from "./gamificationDb";

describe("gamification rules", () => {
  it("converts XP to levels consistently", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(19999)).toBe(200);
  });

  it("uses the requested rank thresholds", () => {
    expect(rankForLevel(1)).toBe("Iniciante");
    expect(rankForLevel(4)).toBe("Bom Estudante");
    expect(rankForLevel(8)).toBe("Estudante Dedicado!");
    expect(rankForLevel(100)).toBe("Mente Brilhante");
    expect(rankForLevel(200)).toBe("Lenda do Acaraú Educa+");
  });

  it("calculates the next level XP target", () => {
    expect(xpForNextLevel(1)).toBe(100);
    expect(xpForNextLevel(8)).toBe(800);
  });
});
