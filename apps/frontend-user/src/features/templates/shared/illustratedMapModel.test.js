import { describe, expect, it } from 'vitest';
import { blankMap, connectMapNodes, fitMapNode, mapSize, moveMapNode, normalizeMap, roadEndpoints } from './illustratedMapModel';
import { MAP_PRESETS, createMapPreset } from './mapPresets';

const node = { id:'old-road',type:'road',x:.4,y:.5,width:.3,height:.04,rotation:0,label:{km:'ផ្លូវចាស់',en:'Saved road'} };
describe('versioned illustrated-map geometry',()=>{
  it('normalizes V1 without changing IDs, labels, positions or input',()=>{
    const v1={version:1,enabled:true,theme:'ivory',aspectRatio:'portrait',description:{km:'គំនូរ',en:'Map'},nodes:[node]};
    const before=JSON.stringify(v1), result=normalizeMap(v1);
    expect(result.version).toBe(2);expect(result.nodes).toEqual(v1.nodes);expect(JSON.stringify(v1)).toBe(before);
    expect(result.settings).toEqual({showLegend:true,showDirectionsButton:true});
    expect(normalizeMap({...result,version:99})).toEqual(blankMap());
  });
  it.each(['landscape','portrait','square'])('keeps rotated geometry inside %s bounds',aspectRatio=>{
    const map={aspectRatio};const [w,h]=mapSize(map);
    const result=fitMapNode({...node,x:1,y:-1,width:.8,height:.8,rotation:45},map);
    const a=result.rotation*Math.PI/180;
    const rx=(Math.abs(Math.cos(a))*result.width*w+Math.abs(Math.sin(a))*result.height*h)/(2*w);
    const ry=(Math.abs(Math.sin(a))*result.width*w+Math.abs(Math.cos(a))*result.height*h)/(2*h);
    expect(result.x-rx).toBeGreaterThanOrEqual(0);expect(result.x+rx).toBeLessThanOrEqual(1);
    expect(result.y-ry).toBeGreaterThanOrEqual(0);expect(result.y+ry).toBeLessThanOrEqual(1);
  });
  it('snaps a moved segment to an existing endpoint without a road gap',()=>{
    const map=blankMap(),other={...node,id:'anchor',x:.3,width:.3};
    const result=moveMapNode({...node,id:'moved',width:.2},.559,.5,[other],map,true).node;
    expect(roadEndpoints(result,map)[0].x).toBeCloseTo(roadEndpoints(other,map)[1].x,8);
    expect(moveMapNode(node,.433,.44,[],map,false).node.x).toBeCloseTo(.433);
  });
  it('connects distant landmarks with bounded contiguous road segments',()=>{
    const map={aspectRatio:'portrait'}, a={...node,type:'venue',x:.1,y:.1},b={...node,type:'parking',x:.9,y:.9};
    const roads=connectMapNodes(a,b,map);
    expect(roads.length).toBeGreaterThan(1);expect(roads.every(r=>r.width<=.8)).toBe(true);
    expect(roadEndpoints(roads[0],map)[0].x).toBeCloseTo(a.x,8);
    for(let i=1;i<roads.length;i++) expect(roadEndpoints(roads[i-1],map)[1].y).toBeCloseTo(roadEndpoints(roads[i],map)[0].y,8);
    expect(roadEndpoints(roads.at(-1),map)[1].y).toBeCloseTo(b.y,8);
  });
  it('has ten original examples with independent stable identities and bounded node counts',()=>{
    expect(MAP_PRESETS).toHaveLength(10);
    for(const preset of MAP_PRESETS){
      const first=createMapPreset(preset.id),second=createMapPreset(preset.id);
      expect(first.length).toBeLessThanOrEqual(80);expect(new Set([...first,...second].map(n=>n.id)).size).toBe(first.length*2);
      expect(createMapPreset(preset.id,{idPrefix:'sample'})).toEqual(createMapPreset(preset.id,{idPrefix:'sample'}));
    }
  });
});
