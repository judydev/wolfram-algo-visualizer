import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function AuthenticatedWrapper({ children, unAuthenticated }: { children: React.ReactNode, unAuthenticated?: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();

        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };

        fetchUser();
    }, []);
        
    if (!user) {
        return unAuthenticated ? unAuthenticated : <div />;
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-12">
            {children}
        </div>
    );
}
