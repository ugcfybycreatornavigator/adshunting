"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, Database, Globe2, KeyRound, Loader2, LogOut, RefreshCw, Search, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useClerk } from "@clerk/nextjs";

type Configured = { supabase:boolean;searchApi:boolean;meta:boolean;foreplay:boolean;googleSearch:boolean;mediaArchival:boolean };
type State = { configured:boolean;connected:boolean|null;status?:string;error?:string };
type Status = { supabase:State;storage?:State;clerk?:State;searchApi:State;meta:State;foreplay:State;googleSearch:State;mediaArchival:State;activeAdsProvider?:string };

export function SettingsView({configured,email}:{configured:Configured;email:string|null}){
  const initial:Status={supabase:base(configured.supabase),storage:base(configured.supabase),clerk:{configured:true,connected:true,status:"CONNECTED"},searchApi:base(configured.searchApi),meta:base(configured.meta),foreplay:base(configured.foreplay),googleSearch:base(configured.googleSearch),mediaArchival:{configured:configured.mediaArchival,connected:configured.mediaArchival}};
  const[status,setStatus]=useState<Status>(initial);
  const[testing,setTesting]=useState(false);
  const[testError,setTestError]=useState("");
  const[signingOut,setSigningOut]=useState(false);
  const { signOut } = useClerk();

  useEffect(()=>{fetch("/api/integrations/status").then(response=>response.json()).then(setStatus).catch(()=>undefined)},[]);
  
  async function testConnections(){
    setTesting(true);
    setTestError("");
    try{
      const response=await fetch("/api/integrations/status",{method:"POST"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.message||"Connection test failed.");
      setStatus(data);
    }catch(error){
      setTestError(error instanceof Error?error.message:"Connection test failed.");
    }finally{
      setTesting(false);
    }
  }

  async function handleSignOut(){
    setSigningOut(true);
    try{
      await signOut({ redirectUrl: "/sign-in" });
    }catch{
      setSigningOut(false);
    }
  }

  return <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
    <div className="space-y-5">
      <Card className="p-5 shadow-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Integrations</h2>
            <p className="mt-1 text-xs text-muted">Secrets stay server-side. Tests consume a small amount of provider quota.</p>
          </div>
          <Button variant="secondary" onClick={testConnections} disabled={testing}>{testing?<Loader2 className="animate-spin" size={15}/>:<RefreshCw size={15}/>}Test connections</Button>
        </div>
        {testError&&<p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-signal">{testError}</p>}
        <div className="mt-5 divide-y divide-line rounded-xl border border-line">
          <Connection icon={<ShieldCheck/>} name="Clerk Authentication" body="User identity, sign in, sign up, and JWT sessions" state={status.clerk || {configured:true,connected:true,status:"CONNECTED"}} />
          <Connection icon={<Database/>} name="Supabase Database" body="PostgreSQL, RLS policies, and data persistence" state={status.supabase}/>
          <Connection icon={<Database/>} name="Supabase Storage" body="Private, signed creative archive storage" state={status.storage || status.supabase}/>
          <Connection icon={<Search/>} name="SearchAPI Meta Ads" body="Multi-key pool with automatic rotation and failover" state={status.searchApi}/>
          <Connection icon={<Search/>} name="Foreplay" body="Discovery and creative metadata through the server-side Public API" state={status.foreplay}/>
          <Connection icon={<KeyRound/>} name="Direct Meta API" body="Official Graph API ads_archive provider when separately authorized" state={status.meta}/>
          <Connection icon={<Globe2/>} name="Google Search" body="Optional brand and landing-page web enrichment" state={status.googleSearch}/>
          <Connection icon={<ShieldCheck/>} name="Creative archival" body="Rights-aware permanent media copying" state={status.mediaArchival} optional/>
        </div>
      </Card>
      <Card className="p-5 shadow-none">
        <h2 className="text-base font-semibold">Intelligence methodology</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Runlytics derives scores from observable ad longevity, repeated creatives, active variants, recency, and advertiser activity. It does not infer or claim private CTR, ROAS, conversion, spend, or revenue data.</p>
        <div className="mt-4 rounded-lg bg-surface p-4 text-xs leading-5 text-muted">An inactive state requires verified provider status or repeated verified catalogue misses. Temporary provider omissions do not immediately stop an ad’s running clock.</div>
      </Card>
    </div>
    <aside>
      <Card className="p-5 shadow-none">
        <p className="text-xs font-semibold text-muted">Signed in as</p>
        <p className="mt-2 break-all text-sm font-semibold">{email||"Authenticated User"}</p>
        <Button variant="secondary" className="mt-5 w-full" onClick={handleSignOut} disabled={signingOut}>
          <LogOut size={15}/>Sign out
        </Button>
      </Card>
      <Card className="mt-5 border-red-100 bg-red-50 p-5 shadow-none">
        <TriangleAlert size={17} className="text-signal"/>
        <h3 className="mt-3 text-sm font-semibold">Secret handling</h3>
        <p className="mt-2 text-xs leading-5 text-muted">Meta, Google, SearchAPI, and Supabase service credentials are referenced only by server modules. Health responses never return credential values.</p>
      </Card>
    </aside>
  </div>;
}

function base(configured:boolean):State{return{configured,connected:null}}
function Connection({icon,name,body,state,optional}:{icon:React.ReactNode;name:string;body:string;state:State;optional?:boolean}){
  const isTokenExpired = state.status === "TOKEN_EXPIRED";
  const isDegraded = state.status === "DEGRADED";
  const label = !state.configured
    ? (optional ? "Opt-in off" : "Not configured")
    : isTokenExpired
    ? "Token Expired"
    : isDegraded
    ? "Connected · Limited"
    : state.connected === true
    ? "Connected"
    : state.connected === false
    ? "Connection failed"
    : "Configured";

  const Icon = !state.configured || state.connected === null ? CircleDashed : state.connected ? CheckCircle2 : XCircle;
  const labelColor = isDegraded ? "text-amber-700" : state.connected === true ? "text-emerald-700" : isTokenExpired ? "text-amber-600 font-bold" : state.connected === false ? "text-signal" : "text-zinc-400";

  return (
    <div className="flex items-start gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface text-muted [&>svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{name}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-muted">{body}</p>
        {isTokenExpired ? (
          <p className="mt-1.5 text-[11px] font-medium leading-4 text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
            A new Meta access token is required. Fallback provider SearchAPI is active.
          </p>
        ) : state.error ? (
          <p className={`mt-1.5 text-[11px] leading-4 ${isDegraded ? "text-amber-700" : "text-signal"}`}>{state.error}</p>
        ) : null}
      </div>
      <span className={`flex shrink-0 items-center gap-1 text-[11px] font-semibold ${labelColor}`}>
        <Icon size={14}/>
        {label}
      </span>
    </div>
  );
}
