export function bezierSubDivision(params: number[], count: number): number[][] {
  const out: number[][] = [];
  let currentBeziel = params;
  for (let i = 0; i < count - 1; i++) {
    // 假如分成5分，分别在 1/5, 1/4, 1/3, 1/2处拆分
    const [bezier1, bezier2] = divideBezierAt(currentBeziel, 1 / (count - i));
    out.push(bezier1);
    if (i === count - 2) {
      out.push(bezier2);
    }
    currentBeziel = bezier2;
  }
  return out;
}

export function divideBezierAt(params: number[], e: number): number[][] {
  const [pax, pay, pbx, pby, pcx, pcy, pdx, pdy] = params;
  const t1 = 1 - e;
  const pe = {
    x: pax * t1 ** 3 + pbx * 3 * t1 ** 2 * e + pcx * 3 * t1 * e ** 2 + pdx * e ** 3,
    y: pay * t1 ** 3 + pby * 3 * t1 ** 2 * e + pcy * 3 * t1 * e ** 2 + pdy * e ** 3,
  };
  const pf = {
    x: pax * t1 + pbx * e,
    y: pay * t1 + pby * e,
  };
  const pg = {
    x: pbx * t1 + pcx * e,
    y: pby * t1 + pcy * e,
  };
  const ph = {
    x: pcx * t1 + pdx * e,
    y: pcy * t1 + pdy * e,
  };

  const pi = {
    x: pf.x * t1 + pg.x * e,
    y: pf.y * t1 + pg.y * e,
  };
  const pj = {
    x: pg.x * t1 + ph.x * e,
    y: pg.y * t1 + ph.y * e,
  };
  return [
    [pax, pay, pf.x, pf.y, pi.x, pi.y, pe.x, pe.y],
    [pe.x, pe.y, pj.x, pj.y, ph.x, ph.y, pdx, pdy],
  ];
}


export function bezierMonotoneSubDivision(params: number[], axis: 'x' | 'y'): number[][] {
  // 拆分bezier曲线，保证曲线的单调性
  const [x0, y0, x1, y1, x2, y2, x3, y3] = params;
  const ax = x3 - 3 * x2 + 3 * x1 - x0;// t^3
  const bx = 3 * x2 - 6 * x1 + 3 * x0; // t^2
  const cx = 3 * x1 - 3 * x0; // t
  // 导数是二次方程
  const a = 3 * ax**2;
  const b = 2 * bx;
  const c = cx;
  const discriminant = b**2 - 4 * a * c;
  if (discriminant < 0) {
    // 没有解
    return [];
  }
}