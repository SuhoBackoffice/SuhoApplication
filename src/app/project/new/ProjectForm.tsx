"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Form } from "@/components/ui/form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn, delay } from "@/lib/utils";

import { getVersions, createProject } from "@/lib/api/project";
import { VersionItem } from "@/types/project";

// ---------------------
// ✅ 스키마 정의
// ---------------------
const formSchema = z.object({
  projectName: z.string().min(1, "프로젝트명을 입력하세요"),
  versionId: z.string().min(1, "버전을 선택해주세요"),
  startDate: z.date({ required_error: "시작일을 선택해주세요" }),
  rows: z
    .array(
      z.object({
        productCode: z.number().min(1, "제품 코드는 1 이상이어야 합니다"),
        quantity: z.string().min(1, "수량을 입력하세요"),
      })
    )
    .refine(
      (rows) => {
        const codes = rows.map((r) => r.productCode);
        return new Set(codes).size === codes.length;
      },
      { message: "중복된 제품 코드가 있습니다" }
    ),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------
// ✅ 컴포넌트
// ---------------------
export default function ProjectForm() {
  const router = useRouter();
  const [versionOptions, setVersionOptions] = useState<VersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      versionId: "",
      startDate: undefined,
      rows: Array.from({ length: 10 }, (_, i) => ({
        productCode: i + 1,
        quantity: "",
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await getVersions();
        if (res.success && res.data) {
          setVersionOptions(res.data);
        } else {
          toast.error(res.message || "버전 목록을 불러오지 못했습니다.");
        }
      } catch {
        toast.error("버전 목록 조회 중 오류가 발생했습니다.");
      }
    };

    fetchVersions();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await createProject(data);
      if (result.success && result.data) {
        toast.success("프로젝트 생성 성공. 상세 페이지로 이동합니다.", {
          description: result.message,
        });
        await delay(500);
        router.push(`/project/${result.data.projectId}`);
      } else {
        toast.error(result.message || "프로젝트 생성에 실패했습니다.");
      }
    } catch (error) {
      toast.error("프로젝트 생성 실패", {
        description:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRow = () => {
    const currentRows = form.getValues().rows;
    append({ productCode: currentRows.length + 1, quantity: "" });
  };

  const formatCode = (num: number) => num.toString().padStart(3, "0");

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: number) => void
  ) => {
    const parsed = parseInt(e.target.value, 10);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className="p-6 flex justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full max-w-md"
        >
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>프로젝트 이름</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="예: 평택 P4L 상서 ANI"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="versionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>버전 선택</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="버전을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {versionOptions.map((v) => (
                      <SelectItem key={v.versionId} value={String(v.versionId)}>
                        {v.versionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>시작일</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ko })
                        ) : (
                          <span>날짜 선택</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>생산 시작일을 선택하세요.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4">
              <FormField
                control={form.control}
                name={`rows.${index}.productCode`}
                render={({ field: productField }) => (
                  <FormItem>
                    <FormLabel>제품 번호</FormLabel>
                    <FormControl>
                      <Input
                        value={formatCode(productField.value)}
                        onChange={(e) =>
                          handleNumberInput(e, productField.onChange)
                        }
                        className="w-32"
                        type="number"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`rows.${index}.quantity`}
                render={({ field: quantityField }) => (
                  <FormItem>
                    <FormLabel>생산 개수</FormLabel>
                    <FormControl>
                      <Input
                        {...quantityField}
                        className="w-32"
                        type="number"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
                className="w-10 h-10 p-0 mt-5 flex justify-center items-center"
                disabled={isLoading || fields.length <= 1}
              >
                -
              </Button>
            </div>
          ))}

          <Button
            type="button"
            onClick={addRow}
            className="mt-4"
            disabled={isLoading}
          >
            +
          </Button>

          <div className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "제출 중..." : "제출"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
