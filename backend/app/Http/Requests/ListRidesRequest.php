<?php

namespace App\Http\Requests;

use App\Models\Location;
use App\Models\Ride;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListRidesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Ride::class) === true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'location' => [
                'nullable',
                'uuid',
                Rule::exists(Location::class, 'external_id')->where(
                    fn ($query) => $query
                        ->whereNull('user_id')
                        ->orWhere('user_id', $this->user()?->id),
                ),
            ],
            'range' => ['sometimes', Rule::in(['all', 'week', 'month', 'year'])],
            'per_page' => ['sometimes', Rule::in([10, 25, 50])],
        ];
    }
}
