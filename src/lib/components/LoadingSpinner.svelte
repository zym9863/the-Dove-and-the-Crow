<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let text = '加载中...';
	export let showText = true;

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	};
</script>

<div class="flex flex-col items-center justify-center">
	<div class="relative">
		<!-- 外圈 -->
		<div class="absolute inset-0 border-2 border-dove-200 rounded-full {sizeClasses[size]}"></div>
		<!-- 旋转圈 -->
		<div class="border-2 border-dove-500 border-t-transparent rounded-full animate-spin {sizeClasses[size]}"></div>
	</div>
	
	{#if showText}
		<p class="mt-3 text-crow-600 text-sm animate-pulse">{text}</p>
	{/if}
</div>
