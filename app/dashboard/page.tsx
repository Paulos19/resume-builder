
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit } from "lucide-react";

interface Resume {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch("/api/resumes");
        if (!res.ok) {
          throw new Error("Falha ao buscar currículos");
        }
        const data: Resume[] = await res.json();
        setResumes(data);
      } catch (err: unknown) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoadingResumes(false);
      }
    };

    if (status === "authenticated") {
      fetchResumes();
    }
  }, [session, status]);

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Tem certeza de que deseja excluir este currículo?")) return;

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir currículo");
      }

      setResumes(resumes.filter((resume) => resume.id !== resumeId));
    } catch (err: unknown) {
      setError(err.message);
      console.error("Erro ao excluir currículo:", err);
      alert(`Erro ao excluir currículo: ${err.message}`);
    }
  };

  if (status === "loading" || loadingResumes) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!session) {
    redirect("/login");
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Erro: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Meus Currículos</h1>
        <Button asChild>
          <Link href="/resume-builder">Criar Novo Currículo</Link>
        </Button>
      </div>

      {resumes.length === 0 ? (
        <p className="text-muted-foreground">Nenhum currículo encontrado. Crie um novo para começar!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <CardTitle>{resume.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Criado em: {new Date(resume.createdAt).toLocaleDateString()}
                </div>
                <div className="space-x-2">
                  <Link href={`/resume-builder?resumeId=${resume.id}`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(resume.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

