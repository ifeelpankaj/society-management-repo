import { useState } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

type InputFocusEvent = Parameters<NonNullable<TextInputProps["onFocus"]>>[0];
type InputBlurEvent = Parameters<NonNullable<TextInputProps["onBlur"]>>[0];

export function Input({ label, error, className, editable = true, onBlur, onFocus, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused && editable;

  const handleFocus = (event: InputFocusEvent) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: InputBlurEvent) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <View className="w-full gap-2 pt-2">
      <Text
        className={[
          "absolute left-3 top-0 z-10 bg-[#fffbf5] px-1 text-sm font-medium",
          error ? "text-rose-600" : isActive ? "text-teal-700" : "text-stone-800",
        ].join(" ")}
      >
        {label}
      </Text>
      <TextInput
        cursorColor="#0f766e"
        editable={editable}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor="#9ca3af"
        selectionColor="#5eead4"
        className={[
          "min-h-14 rounded-lg border-2 bg-[#fffbf5] px-3 pb-2 pt-4 text-base text-stone-950",
          error ? "border-rose-400" : isActive ? "border-teal-600" : "border-stone-700",
          editable ? "" : "bg-stone-100 text-stone-500",
          className ?? "",
        ].join(" ")}
        {...props}
      />
      {error ? <Text className="text-sm font-medium text-rose-600">{error}</Text> : null}
    </View>
  );
}
