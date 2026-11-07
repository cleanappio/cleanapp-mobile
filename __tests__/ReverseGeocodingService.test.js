import {reverseGeocode, batchReverseGeocode} from '../src/services/ReverseGeocodingService';
beforeEach(() => {global.fetch = jest.fn();});
afterEach(() => {jest.useRealTimers();});
test('uses the first-party endpoint without a credential and supports zero coordinates', async () => {
  fetch.mockResolvedValue({ok:true,status:200,json:async()=>({success:true,address:'Accra',provider:'amazon-location'})});
  expect(await reverseGeocode(0,0,'en')).toEqual({success:true,address:'Accra'});
  expect(fetch.mock.calls[0][0]).toBe('https://www.cleanapp.io/api/geocode?lat=0&lng=0&language=en');
  expect(fetch.mock.calls[0][1].signal).toBeDefined();
});
test.each([[NaN,0],[0,Infinity],[91,0],[0,-181],[null,1],['1',2]])('rejects bad coordinates %s,%s without network calls',async(lat,lng)=>{
  expect((await reverseGeocode(lat,lng)).success).toBe(false);expect(fetch).not.toHaveBeenCalled();
});
test('handles no result, throttling, malformed payload and network errors without leaking details',async()=>{
  for(const r of [{ok:false,status:404,json:async()=>({success:false})},{ok:false,status:429,json:async()=>({})},{ok:true,status:200,json:async()=>({success:true})}]) {fetch.mockResolvedValueOnce(r);expect((await reverseGeocode(47,8)).success).toBe(false);}
  fetch.mockRejectedValueOnce(Error('private upstream details'));expect(await reverseGeocode(47,8)).toEqual({success:false,error:'Address lookup is unavailable. Please try again'});
});
test('aborts a stalled request and preserves batch coordinate associations',async()=>{
  jest.useFakeTimers();fetch.mockImplementationOnce((_,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted')))));
  const pending=reverseGeocode(47,8);await jest.advanceTimersByTimeAsync(12000);expect((await pending).success).toBe(false);jest.useRealTimers();
  fetch.mockResolvedValue({ok:true,status:200,json:async()=>({success:true,address:'Test'})});
  const coordinates=[{latitude:0,longitude:0},{latitude:-33,longitude:151}];const results=await batchReverseGeocode(coordinates);expect(results.map(r=>r.coordinates)).toEqual(coordinates);expect(results.every(r=>r.success)).toBe(true);
});
