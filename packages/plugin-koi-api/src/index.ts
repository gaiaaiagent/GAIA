import { Plugin, Service, IAgentRuntime } from "@elizaos/core";

class KOIApiService extends Service {
    static serviceName = "koiApi";
    protected runtime!: IAgentRuntime;
    
    async initialize(runtime: IAgentRuntime): Promise<void> {
        this.runtime = runtime;
        console.log("[KOI API Service] Initialized");
        
        // Setup the Express routes if the server has an app
        const app = (runtime as any).app;
        if (app && typeof app.use === 'function') {
            this.setupRoutes(app);
        }
    }
    
    async stop(): Promise<void> {
        console.log("[KOI API Service] Stopped");
    }
    
    get capabilityDescription(): string {
        return "Proxies KOI dashboard API requests to the coordinator and event bridge";
    }
    
    private setupRoutes(app: any): void {
        console.log("[KOI API Service] Setting up routes");
        
        // Proxy all /api/koi/* requests to the KOI API proxy server
        app.use("/api/koi", async (req: any, res: any) => {
            try {
                const proxyUrl = `http://localhost:3011${req.url}`;
                console.log(`[KOI API] Proxying ${req.method} ${req.url} to ${proxyUrl}`);
                
                const response = await fetch(proxyUrl, {
                    method: req.method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...req.headers as any
                    },
                    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
                });
                
                const data = await response.json();
                res.status(response.status).json(data);
            } catch (error) {
                console.error("[KOI API] Proxy error:", error);
                res.status(503).json({
                    status: "error",
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });
        
        console.log("[KOI API Service] Routes registered");
    }
}

export const koiApiPlugin: Plugin = {
    name: "koi-api",
    description: "KOI API proxy for dashboard monitoring",
    
    actions: [],
    evaluators: [],
    providers: [],
    
    services: [new KOIApiService()]
};

export default koiApiPlugin;