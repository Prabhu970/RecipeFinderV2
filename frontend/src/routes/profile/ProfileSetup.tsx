import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export function ProfileSetup() {
  const [fullName, setFullName] = useState("");
  const [diet, setDiet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // load current user & profile if exists
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name, diet")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.display_name ?? "");
        setDiet(profile.diet ?? "");
      }
    })();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You are not logged in");
        return;
      }

      const { error: upsertError } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          display_name: fullName,
          diet,
        });

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      // Also persist name in public.users.name if you want
      await supabase
        .from("users")
        .update({ name: fullName })
        .eq("id", user.id);

      navigate("/"); // go to home/recipes
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        Complete your profile
      </h2>
      <p className="text-sm text-gray-500">
        This helps us personalize your recipe recommendations.
      </p>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Prabhu Gopal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Diet preference</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
          >
            <option value="">No preference</option>
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="keto">Keto</option>
            <option value="gluten-free">Gluten-free</option>
            <option value="pescatarian">Pescatarian</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
