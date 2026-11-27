export function project([lat,lon]) {return [(lon-42)*14,(39-lat)*14];}
export function geometryPath(geometry) {
 const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
 return polygons.map(poly=>poly.map(ring=>ring.map(([lon,lat],i)=>{const[x,y]=project([lat,lon]);return`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ')+'Z').join(' ')).join(' ');
}
